import { GoogleGenerativeAI } from "@google/generative-ai";
import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { checkUsageAllowed, incrementUsage } from "@/lib/usage";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    const allowed = await checkUsageAllowed(user.id, "review_reply");
    if (!allowed) {
      return Response.json(
        { error: "Monthly AI reply limit reached (5/mo on Free). Upgrade to Pro for unlimited replies." },
        { status: 429 }
      );
    }

    const body = await request.json() as {
      reviewBody?: string;
      rating?: number;
      authorName?: string;
      businessName?: string;
      sentiment?: string;
    };

    const { reviewBody, rating, authorName, businessName, sentiment } = body;

    if (!reviewBody || !rating || !authorName || !businessName) {
      return Response.json({ error: "reviewBody, rating, authorName, and businessName are required." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "GEMINI_API_KEY is not configured." }, { status: 500 });
    }

    const firstName = authorName.split(/[\s.]/)[0];

    // Tone guide shifts by star rating so negative reviews never sound dismissive
    const toneGuide =
      rating >= 4
        ? `The review is positive. Express genuine gratitude, acknowledge what they loved, and invite them back.`
        : rating === 3
        ? `The review is mixed. Thank them for honest feedback, acknowledge the shortcoming specifically, and explain how you're improving it.`
        : `The review is negative (${rating} star). Open with a sincere, non-defensive apology. Take full accountability for the issue — no excuses. Invite them to contact you directly to make it right. Keep the tone calm and professional.`;

    const prompt = `You are the owner of "${businessName}", a professional HVAC service company writing a reply to a customer review on Google.

Reviewer: ${firstName} (full name: ${authorName})
Star rating: ${rating}/5
Sentiment: ${sentiment ?? "unknown"}
Review text: "${reviewBody}"

${toneGuide}

Generate THREE distinct reply variants so the owner can pick the one that sounds most like them. Return JSON with this EXACT shape:
{
  "formal":     "<polished, professional reply>",
  "friendly":   "<warm, conversational reply>",
  "apologetic": "<accountability-forward reply that leads with ownership>"
}

Each variant must:
- Address ${firstName} by first name in the opening line
- Be 60–90 words
- No emojis, no hashtags, no "Best regards" or formal sign-offs
- Avoid generic phrases like "we value your feedback" or "we strive to"
- Sound like a real person wrote it
- Reference specific HVAC services (AC, furnace, heat pump, ducts, etc.) if the review mentions them

Variant tone differences:
- formal:     polished, businesslike, third-person company voice acceptable
- friendly:   warm, casual, first-person, owner's personal voice
- apologetic: lead with accountability and a concrete commitment, even on positive reviews
              (e.g. "we owe it to you to keep delivering that level of service")

Return ONLY the JSON object. No markdown, no code fences, no preamble.`;

    console.log("[generate-reply] calling Gemini for reviewer:", firstName, "| rating:", rating);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite-preview",
      generationConfig: { responseMimeType: "application/json" },
    });

    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (geminiError: unknown) {
      const e = geminiError as Record<string, unknown>;
      console.error("[generate-reply] Gemini API error ——————————————");
      console.error("  message    :", e?.message);
      console.error("  status     :", e?.status);
      console.error("  statusText :", e?.statusText);
      console.error("  errorDetails:", JSON.stringify(e?.errorDetails ?? e, null, 2));
      console.error("————————————————————————————————————————————————");
      const msg = typeof e?.message === "string" ? e.message : "Gemini API call failed.";
      return Response.json({ error: msg }, { status: 500 });
    }

    const rawText = result.response.text().trim();
    const cleaned = rawText
      .replace(/^```(?:json)?[\r\n]*/i, "")
      .replace(/[\r\n]*```$/i, "")
      .trim();

    let variants: { formal?: string; friendly?: string; apologetic?: string };
    try {
      variants = JSON.parse(cleaned) as typeof variants;
    } catch {
      console.error("[generate-reply] failed to parse Gemini JSON:", cleaned);
      // Fall back: treat the whole text as the friendly variant so the user gets something
      variants = { friendly: rawText };
    }

    const replies = {
      formal:     (variants.formal     ?? "").trim(),
      friendly:   (variants.friendly   ?? "").trim(),
      apologetic: (variants.apologetic ?? "").trim(),
    };

    if (!replies.formal && !replies.friendly && !replies.apologetic) {
      throw new Error("Gemini returned no usable reply variants.");
    }

    await incrementUsage(user.id, "review_reply");

    // Backwards compatibility: single `reply` field too (the old caller still
    // exists in case anything else hits this endpoint)
    const primary = replies.friendly || replies.formal || replies.apologetic;
    console.log("[generate-reply] success, primary length:", primary.length);
    return Response.json({ reply: primary, replies });
  } catch (error: unknown) {
    const e = error as Record<string, unknown>;
    console.error("[generate-reply] unhandled error:", e?.message ?? error);
    return Response.json(
      { error: "Failed to generate reply. Please try again." },
      { status: 500 }
    );
  }
}
