import { GoogleGenerativeAI } from "@google/generative-ai";
import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { checkUsageAllowed, incrementUsage } from "@/lib/usage";
import { fetchGoogleSuggestions } from "@/lib/google-suggest";

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Rate-limit check before spending any Gemini quota
    const allowed = await checkUsageAllowed(user.id, "keyword_generation");
    if (!allowed) {
      return Response.json(
        {
          error:
            "Monthly keyword generation limit reached. Upgrade to Pro for unlimited access.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    console.log("[generate-keywords] incoming body:", body);

    const { businessName, location } = body;

    if (!businessName || !location) {
      console.error("[generate-keywords] missing fields:", { businessName, location });
      return Response.json(
        { error: "businessName and location are required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[generate-keywords] GEMINI_API_KEY is not set in environment.");
      return Response.json(
        { error: "GEMINI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    // Pull real Google Suggest data so the model is grounded in actual search
    // demand for the area. Seeds use the business name + location only — no
    // industry assumptions, so the model isn't biased toward HVAC for non-HVAC
    // businesses.
    const suggestSeeds = [
      `${businessName} ${location}`,
      `${businessName}`,
      `${businessName} near me`,
      `best ${businessName}`,
      `${location} ${businessName}`,
    ];

    const suggestions = (await fetchGoogleSuggestions(suggestSeeds)).slice(0, 40);
    console.log(`[generate-keywords] pulled ${suggestions.length} Google Suggest seeds`);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite-preview",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    // The prompt analyzes the business name to figure out the actual industry,
    // then generates keywords specific to it. Falls back to HVAC only when the
    // name actually implies HVAC.
    const suggestBlock = suggestions.length > 0
      ? [
          `STEP 2 — Real Google search demand for this business + area:`,
          `These are actual queries people typed into Google related to "${businessName}" in "${location}".`,
          `Use them to confirm the industry and shape your final list around real demand.`,
          ``,
          ...suggestions.map((s) => `- ${s}`),
          ``,
        ]
      : [
          `STEP 2 — (Google Suggest data unavailable; rely on the business name to infer the industry.)`,
          ``,
        ];

    const prompt = [
      `You are a local SEO expert. Generate exactly 12 high-intent LOCAL search keywords for this specific business in this specific location.`,
      ``,
      `Business name: "${businessName}"`,
      `Location: "${location}"`,
      ``,
      `STEP 1 — Identify the industry from the business name (NOT from any default assumption):`,
      `- The business name may be in any language (Turkish, Spanish, English, French, etc.).`,
      `- Examples: "tesisatçı"=plumber, "kuaför"=hairdresser, "lokanta"=restaurant, "elektrikçi"=electrician, "boyacı"=painter.`,
      `- ONLY use HVAC/heating/cooling keywords if the business name itself contains HVAC terms (HVAC, heating, cooling, AC, furnace, climate, air conditioning).`,
      `- If the name does not indicate HVAC, DO NOT generate HVAC keywords. Generate keywords for the actual identified industry.`,
      ``,
      ...suggestBlock,
      `STEP 3 — Generate the final list (MANDATORY rules — break any rule = wrong output):`,
      `- Every keyword must be relevant to the identified industry from STEP 1.`,
      `- At least 8 of the 12 keywords MUST contain the location string "${location}" (or its city name) verbatim.`,
      `- Mix short-tail (2–3 words) and long-tail (4–6 words).`,
      `- Include at least one urgency keyword (e.g. "emergency", "24 hour", "same day", "near me") if appropriate for the industry.`,
      `- Keywords MUST be in English, search-engine ready, lowercase except proper nouns.`,
      `- Do NOT use generic keywords that could apply to any business in any city. Each keyword must be tied to either the location or the specific service.`,
      ``,
      `STEP 4 — Output:`,
      `Return ONLY a raw JSON array of exactly 12 keyword strings. No markdown, no code fences, no explanation. Just [ ... ].`,
      ``,
      `Examples (do NOT include in output):`,
      `For "Acme HVAC" + "Dallas, TX": ["HVAC repair Dallas TX","emergency AC repair Dallas","furnace replacement Dallas",...]`,
      `For "tesisatçı Mehmet" + "San Bernardino, CA": ["plumber San Bernardino CA","emergency plumber San Bernardino","drain cleaning San Bernardino",...]`,
      `For "Bella's Pizza" + "Austin, TX": ["pizza delivery Austin","best pizza Austin TX","late night pizza Austin",...]`,
    ].join("\n");

    console.log("[generate-keywords] calling Gemini with prompt length:", prompt.length);

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

    console.log("[generate-keywords] raw Gemini response:", rawText);

    // Safety strip: remove any accidental markdown fences
    const cleaned = rawText
      .replace(/^```(?:json)?[\r\n]*/i, "")
      .replace(/[\r\n]*```$/i, "")
      .trim();

    let keywords: string[];

    try {
      const parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed)) {
        throw new Error(`Parsed value is not an array. Got: ${typeof parsed}`);
      }
      keywords = parsed.filter(
        (k): k is string => typeof k === "string" && k.trim().length > 0
      );
    } catch (parseError) {
      console.error("[generate-keywords] JSON.parse failed:", parseError);
      console.error("[generate-keywords] cleaned text that failed to parse:", cleaned);
      // Last-resort fallback: line / comma splitting
      keywords = cleaned
        .split(/[\n,]+/)
        .map((k) => k.replace(/^[\s\-*"'[]+|[\s\-*"'\]]+$/g, "").trim())
        .filter(Boolean);
      console.log("[generate-keywords] fallback parsed keywords:", keywords);
    }

    // Increment only after a successful Gemini response
    await incrementUsage(user.id, "keyword_generation");

    console.log("[generate-keywords] returning keywords:", keywords);
    return Response.json({ keywords });
  } catch (error) {
    console.error("[generate-keywords] unhandled error:", error);
    if (error instanceof Error) {
      console.error("[generate-keywords] error message:", error.message);
      console.error("[generate-keywords] error stack:", error.stack);
    }
    return Response.json(
      { error: "Failed to generate keywords. Please try again." },
      { status: 500 }
    );
  }
}
