import { GoogleGenerativeAI } from "@google/generative-ai";
import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { checkUsageAllowed, incrementUsage } from "@/lib/usage";
import { crawl, CrawlError } from "@/lib/crawler";

interface Issue {
  severity:    "critical" | "warning" | "info";
  element:     string;
  current:     string | null;
  recommended: string;
}

interface GeminiResponse {
  score:  number;
  issues: Issue[];
}

const SEVERITY_VALUES: Issue["severity"][] = ["critical", "warning", "info"];

function isValidIssue(x: unknown): x is Issue {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return SEVERITY_VALUES.includes(o.severity as Issue["severity"])
      && typeof o.element     === "string"
      && typeof o.recommended === "string"
      && (o.current === null || typeof o.current === "string");
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const allowed = await checkUsageAllowed(user.id, "seo_audit");
  if (!allowed) {
    return Response.json(
      { error: "Monthly SEO audit limit reached. Upgrade to Pro for unlimited audits." },
      { status: 429 },
    );
  }

  const body = await request.json() as { business_id?: string };
  const businessId = body.business_id;
  if (!businessId) {
    return Response.json({ error: "business_id is required." }, { status: 400 });
  }

  const { data: biz } = await supabase
    .from("businesses")
    .select("id, business_name, service_location, website_url, target_keywords")
    .eq("id", businessId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!biz) {
    return Response.json({ error: "Business not found." }, { status: 404 });
  }

  if (!biz.website_url) {
    return Response.json(
      { error: "This business has no website URL set. Add one in Business Settings first." },
      { status: 422 },
    );
  }

  // ── Crawl ─────────────────────────────────────────────────────────────────
  let page;
  try {
    page = await crawl(biz.website_url);
  } catch (err) {
    if (err instanceof CrawlError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    console.error("[seo/audit] crawl error:", err);
    return Response.json({ error: "Crawl failed." }, { status: 500 });
  }

  // ── Gemini analysis ───────────────────────────────────────────────────────
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "GEMINI_API_KEY is not configured." }, { status: 500 });
  }

  const keywords = Array.isArray(biz.target_keywords) ? (biz.target_keywords as string[]) : [];

  const prompt = [
    `You are a local SEO auditor for HVAC contractors. Audit this single page and produce a list of concrete issues.`,
    ``,
    `Business: "${biz.business_name}"`,
    `Location: "${biz.service_location}"`,
    `Target keywords (top 5): ${keywords.slice(0, 5).join(", ") || "(none provided)"}`,
    ``,
    `=== Page data ===`,
    `URL:               ${page.url}`,
    `Page title:        ${page.pageTitle ?? "(none)"} ${page.pageTitle ? `(${page.pageTitle.length} chars)` : ""}`,
    `Meta description:  ${page.metaDescription ?? "(none)"} ${page.metaDescription ? `(${page.metaDescription.length} chars)` : ""}`,
    `H1:                ${page.h1 ?? "(none)"}`,
    `H2 count:          ${page.h2Count}`,
    `Word count:        ${page.wordCount}`,
    `Image count:       ${page.imageCount} (${page.imagesMissingAlt} missing alt)`,
    `Has JSON-LD:       ${page.hasSchema ? "yes" : "no"}`,
    `Body excerpt:      ${page.bodySnippet}`,
    ``,
    `=== Audit rules ===`,
    `Return JSON with this EXACT shape, nothing else:`,
    `{`,
    `  "score": <0-100 integer overall SEO health for this page>,`,
    `  "issues": [`,
    `    { "severity": "critical" | "warning" | "info",`,
    `      "element": "<which element, e.g. 'Title tag', 'H1', 'Meta description', 'Image alt text', 'Schema markup'>",`,
    `      "current": "<what's there now, or null>",`,
    `      "recommended": "<concrete actionable fix the owner can copy>"`,
    `    }`,
    `  ]`,
    `}`,
    ``,
    `Score guidance:`,
    `- 90+ = excellent, only minor polish`,
    `- 70-89 = good, some real issues`,
    `- 50-69 = needs work, several gaps`,
    `- below 50 = serious gaps`,
    ``,
    `Issue rules:`,
    `- Title should be 50-60 chars and include the primary keyword + city`,
    `- Meta description 140-160 chars, include keyword + a CTA`,
    `- H1 should match the page intent and contain the primary keyword`,
    `- Word count under 300 = thin content (warning); under 150 = critical`,
    `- Images missing alt = warning (each)`,
    `- No JSON-LD = warning (point to /schema in HeatRank)`,
    `- Look for keyword cannibalization, missing local intent, tone issues`,
    `- ALWAYS include at least 3 issues if any field above is suboptimal`,
    `- Recommendations must be concrete and copy-pasteable, not vague`,
    `- Output ONLY the JSON object. No markdown, no code fences, no preamble.`,
  ].join("\n");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite-preview",
    generationConfig: { responseMimeType: "application/json" },
  });

  let analysis: GeminiResponse;
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text
      .replace(/^```(?:json)?[\r\n]*/i, "")
      .replace(/[\r\n]*```$/i, "")
      .trim();
    const parsed = JSON.parse(cleaned) as Partial<GeminiResponse>;
    const score = typeof parsed.score === "number" ? Math.max(0, Math.min(100, Math.round(parsed.score))) : 0;
    const issues = Array.isArray(parsed.issues) ? parsed.issues.filter(isValidIssue) : [];
    analysis = { score, issues };
  } catch (err) {
    console.error("[seo/audit] Gemini parse error:", err);
    return Response.json({ error: "AI analysis failed. Please try again." }, { status: 500 });
  }

  // ── Persist ───────────────────────────────────────────────────────────────
  const { data: audit, error: dbErr } = await supabase
    .from("seo_audits")
    .insert({
      business_id:        biz.id,
      crawled_url:        page.url,
      page_title:         page.pageTitle,
      meta_description:   page.metaDescription,
      h1:                 page.h1,
      h2_count:           page.h2Count,
      word_count:         page.wordCount,
      image_count:        page.imageCount,
      images_missing_alt: page.imagesMissingAlt,
      has_schema:         page.hasSchema,
      issues:             analysis.issues,
      score:              analysis.score,
    })
    .select("id")
    .single();

  if (dbErr) {
    console.error("[seo/audit] insert error:", dbErr);
    return Response.json({ error: "Failed to save audit." }, { status: 500 });
  }

  await incrementUsage(user.id, "seo_audit");
  console.log(`[seo/audit] business=${biz.id} score=${analysis.score} issues=${analysis.issues.length}`);

  return Response.json({
    ok:     true,
    id:     audit.id,
    score:  analysis.score,
    issues: analysis.issues,
    page,
  });
}
