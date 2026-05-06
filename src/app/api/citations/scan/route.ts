import { GoogleGenerativeAI } from "@google/generative-ai";
import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { crawl, CrawlError } from "@/lib/crawler";

interface ExtractedNAP {
  name:    string | null;
  phone:   string | null;
  address: string | null;
}

function normalizePhone(s: string | null | undefined): string {
  if (!s) return "";
  return s.replace(/[^\d]/g, "");
}

function normalizeText(s: string | null | undefined): string {
  if (!s) return "";
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function detectDirectory(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host;
  } catch {
    return "Unknown";
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json() as { business_id?: string; listing_url?: string };
  const businessId = body.business_id;
  const listingUrl = body.listing_url?.trim();

  if (!businessId || !listingUrl) {
    return Response.json({ error: "business_id and listing_url are required." }, { status: 400 });
  }

  const { data: biz } = await supabase
    .from("businesses")
    .select("id, business_name, phone, street_address, service_location")
    .eq("id", businessId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!biz) {
    return Response.json({ error: "Business not found." }, { status: 404 });
  }

  if (!biz.phone && !biz.street_address) {
    return Response.json(
      { error: "Set your canonical phone and street address first (Edit business)." },
      { status: 422 },
    );
  }

  // ── Crawl the listing ─────────────────────────────────────────────────────
  let page;
  try {
    page = await crawl(listingUrl);
  } catch (err) {
    if (err instanceof CrawlError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    return Response.json({ error: "Failed to fetch the listing." }, { status: 502 });
  }

  // ── Gemini extracts the NAP from the page text ───────────────────────────
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "GEMINI_API_KEY is not configured." }, { status: 500 });
  }

  const prompt = [
    `You are scanning a business directory listing page (Yelp / Angi / BBB / etc.) to extract the business's NAP.`,
    `NAP = Name, Address, Phone.`,
    ``,
    `Page title: ${page.pageTitle ?? "(none)"}`,
    `URL:        ${page.url}`,
    `Body text:  ${page.bodySnippet}`,
    ``,
    `Return JSON with this EXACT shape, nothing else:`,
    `{ "name": "<business name as listed, or null>",`,
    `  "phone": "<phone in any format, or null>",`,
    `  "address": "<full street address line, or null>" }`,
    ``,
    `Only return what is clearly the BUSINESS's NAP for this listing — not other`,
    `businesses also mentioned on the page. If unsure, return null for that field.`,
    `Output the JSON object only — no markdown, no code fences.`,
  ].join("\n");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite-preview",
    generationConfig: { responseMimeType: "application/json" },
  });

  let extracted: ExtractedNAP;
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/^```(?:json)?[\r\n]*/i, "").replace(/[\r\n]*```$/i, "").trim();
    extracted = JSON.parse(cleaned) as ExtractedNAP;
  } catch (err) {
    console.error("[citations/scan] Gemini parse error:", err);
    return Response.json({ error: "AI extraction failed. Try again." }, { status: 500 });
  }

  // ── Compare to canonical ──────────────────────────────────────────────────
  const canonicalPhone = normalizePhone(biz.phone);
  const detectedPhone  = normalizePhone(extracted.phone);
  const canonicalName  = normalizeText(biz.business_name);
  const detectedName   = normalizeText(extracted.name);
  const canonicalAddr  = normalizeText(biz.street_address);
  const detectedAddr   = normalizeText(extracted.address);

  const diffs: Record<string, { canonical: string | null; detected: string | null }> = {};
  if (canonicalName  && detectedName  && canonicalName  !== detectedName)  diffs.name    = { canonical: biz.business_name,  detected: extracted.name    };
  if (canonicalPhone && detectedPhone && canonicalPhone !== detectedPhone) diffs.phone   = { canonical: biz.phone,          detected: extracted.phone   };
  if (canonicalAddr  && detectedAddr  && !detectedAddr.includes(canonicalAddr) && !canonicalAddr.includes(detectedAddr)) {
    diffs.address = { canonical: biz.street_address, detected: extracted.address };
  }

  const isConsistent = Object.keys(diffs).length === 0
    && (!biz.phone || !!detectedPhone)
    && (!biz.business_name || !!detectedName);

  // ── Upsert ────────────────────────────────────────────────────────────────
  const { error: dbErr } = await supabase
    .from("citations")
    .upsert(
      {
        business_id:      biz.id,
        directory:        detectDirectory(listingUrl),
        listing_url:      listingUrl,
        detected_name:    extracted.name    ?? null,
        detected_address: extracted.address ?? null,
        detected_phone:   extracted.phone   ?? null,
        nap_consistent:   isConsistent,
        diff:             diffs,
        last_checked_at:  new Date().toISOString(),
      },
      { onConflict: "business_id,listing_url" },
    );

  if (dbErr) {
    console.error("[citations/scan] upsert error:", dbErr);
    return Response.json({ error: "Failed to save citation." }, { status: 500 });
  }

  return Response.json({
    ok:         true,
    consistent: isConsistent,
    extracted,
    diff:       diffs,
  });
}
