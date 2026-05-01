import { GoogleGenerativeAI } from "@google/generative-ai";
import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { checkUsageAllowed, incrementUsage } from "@/lib/usage";

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

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite-preview",
      generationConfig: {
        // Force plain text so the model cannot produce markdown fences
        responseMimeType: "application/json",
      },
    });

    // The prompt is kept intentionally explicit and short to prevent the model
    // from wrapping the output in markdown or prose.
    const prompt = [
      `Return ONLY a raw JSON array of 12 HVAC SEO keyword strings.`,
      `No markdown. No code fences. No explanation. No extra text.`,
      `Just the array, starting with [ and ending with ].`,
      ``,
      `Business: "${businessName}"`,
      `Location: "${location}"`,
      ``,
      `Rules:`,
      `- Mix short-tail and long-tail keywords`,
      `- Include "${location}" in at least 5 keywords`,
      `- Cover: AC repair, heating, installation, maintenance, emergency HVAC`,
      `- Include at least one seasonal keyword`,
      ``,
      `Example output (do not include this):`,
      `["HVAC repair Dallas TX","AC installation Dallas","emergency heating repair Dallas TX"]`,
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
