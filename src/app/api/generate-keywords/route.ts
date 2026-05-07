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

    // HeatRank AI is HVAC-only — every business on the platform is an HVAC
    // contractor. Seed Google Suggest with HVAC + the business name so we get
    // real local HVAC demand grounded in this market.
    const suggestSeeds = [
      `${businessName} ${location}`,
      `HVAC ${location}`,
      `AC repair ${location}`,
      `furnace repair ${location}`,
      `heating ${location}`,
      `air conditioning ${location}`,
      `${location} HVAC near me`,
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
      `You are a local SEO expert specialized in HVAC contractors. Generate exactly 12 high-intent LOCAL HVAC search keywords for this contractor.`,
      ``,
      `Business name: "${businessName}"`,
      `Location: "${location}"`,
      ``,
      `Context: This is an HVAC SEO platform. Every business on it is an HVAC / heating / cooling / air conditioning contractor, regardless of how the business name reads. Treat this business as an HVAC contractor.`,
      ``,
      ...suggestBlock,
      `MANDATORY rules (break any rule = wrong output):`,
      `- Every keyword MUST be HVAC-related: AC, air conditioning, heating, furnace, heat pump, ductwork, ventilation, thermostat, indoor air quality, HVAC repair/install/maintenance.`,
      `- At least 9 of the 12 keywords MUST contain "${location}" (or its city name) verbatim.`,
      `- Mix short-tail (2–3 words) and long-tail (4–6 words).`,
      `- Include at least one urgency keyword: "emergency", "24 hour", "same day", or "near me".`,
      `- Cover commercially valuable HVAC services: repair, install/replacement, maintenance/tune-up, emergency.`,
      `- Keywords MUST be in English, lowercase except proper nouns and city names.`,
      `- Each keyword must be specific to either the location or a specific HVAC service — no generic filler.`,
      ``,
      `Output: Return ONLY a raw JSON array of exactly 12 keyword strings. No markdown, no code fences, no explanation. Just [ ... ].`,
      ``,
      `Example for "Acme Cooling" + "Dallas, TX":`,
      `["HVAC repair Dallas TX","emergency AC repair Dallas","furnace replacement Dallas","24 hour AC service Dallas","heat pump installation Dallas","HVAC maintenance Dallas TX","air conditioning install Dallas","commercial HVAC Dallas","ductwork repair Dallas","heating contractor Dallas TX","HVAC tune-up Dallas","AC repair near me"]`,
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
