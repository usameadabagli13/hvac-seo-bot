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
    // demand for the area. Seeds cover HVAC base terms + the business itself.
    // If Suggest fails entirely we still proceed — the prompt handles that.
    const suggestSeeds = [
      `${businessName} ${location}`,
      `HVAC ${location}`,
      `AC repair ${location}`,
      `furnace repair ${location}`,
      `heating ${location}`,
      `${location} HVAC near me`,
    ];

    const suggestions = (await fetchGoogleSuggestions(suggestSeeds)).slice(0, 40);
    console.log(`[generate-keywords] pulled ${suggestions.length} Google Suggest seeds`);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite-preview",
      generationConfig: {
        // Force plain text so the model cannot produce markdown fences
        responseMimeType: "application/json",
      },
    });

    // The prompt analyzes the business name to figure out the actual industry,
    // then generates keywords specific to it. Falls back to HVAC only when the
    // name actually implies HVAC.
    const suggestBlock = suggestions.length > 0
      ? [
          `STEP 2 — Real Google search demand for this area:`,
          `Below are actual queries people typed into Google in this market (pulled from Google Autocomplete).`,
          `Use them as the foundation. Pick the highest-intent ones, polish capitalization,`,
          `and shape your final list around what people are ACTUALLY searching — not what sounds plausible.`,
          ``,
          ...suggestions.map((s) => `- ${s}`),
          ``,
        ]
      : [
          `STEP 2 — (Google Suggest data unavailable; use your training knowledge instead.)`,
          ``,
        ];

    const prompt = [
      `You are a local SEO expert. Generate 12 high-intent local search keywords for this business.`,
      ``,
      `Business name: "${businessName}"`,
      `Location: "${location}"`,
      ``,
      `STEP 1 — Identify the industry from the business name:`,
      `- The business name may be in any language (Turkish, Spanish, English, etc.)`,
      `- "tesisatçı" = plumber, "kuaför" = hairdresser, "lokanta" = restaurant, etc.`,
      `- If the name clearly indicates HVAC (heating, cooling, AC, furnace, HVAC), use HVAC keywords.`,
      `- Otherwise generate keywords for whatever industry the name actually represents.`,
      `- The Google Suggest list below is HVAC-biased — IGNORE it if the business is in a different industry.`,
      ``,
      ...suggestBlock,
      `STEP 3 — Generate the final list:`,
      `- Mix short-tail and long-tail`,
      `- Include "${location}" in at least 5 keywords`,
      `- Cover the most commercially valuable services for the identified industry`,
      `- Include at least one urgency/emergency keyword if relevant (e.g. "24 hour", "emergency", "near me")`,
      `- Keywords MUST be in English (search-engine ready), even if the business name was in another language`,
      `- Do NOT just copy Suggest entries verbatim — refine them, merge duplicates, fix capitalization`,
      ``,
      `STEP 4 — Output:`,
      `Return ONLY a raw JSON array of 12 keyword strings.`,
      `No markdown. No code fences. No explanation. No extra text. Just [ ... ].`,
      ``,
      `Examples for context (do NOT include these in the output):`,
      `For "Acme HVAC" + "Dallas, TX":`,
      `["HVAC repair Dallas TX","emergency AC installation Dallas","furnace repair near me", ...]`,
      `For "tesisatçı" + "San Bernardino, CA":`,
      `["plumber San Bernardino CA","emergency plumbing San Bernardino","drain cleaning near me", ...]`,
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
