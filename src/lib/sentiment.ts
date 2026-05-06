import { GoogleGenerativeAI } from "@google/generative-ai";

interface ReviewInput {
  review_id: string;
  body: string;
}

type Sentiment = "positive" | "neutral" | "negative";

export interface AnalyzedReview {
  sentiment: Sentiment;
  summary:   string | null;   // one-sentence digest, e.g. "Praises fast next-day install"
}

/**
 * Classifies sentiment AND extracts a one-sentence summary for each review in
 * a single Gemini batch call. Returns a Map of review_id → { sentiment, summary }.
 * Falls back silently on API errors so callers can still upsert with a
 * rating-based default sentiment + null summary.
 *
 * Kept the original `analyzeSentiments` export shape for back-compat callers.
 */
export async function analyzeReviews(
  reviews: ReviewInput[],
): Promise<Map<string, AnalyzedReview>> {
  const result = new Map<string, AnalyzedReview>();
  if (reviews.length === 0) return result;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[sentiment] GEMINI_API_KEY not set — skipping analysis");
    return result;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite-preview",
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `You are analyzing HVAC customer reviews. For each review, return its sentiment classification AND a one-sentence summary.

Return ONLY a JSON array — one object per review, in the same order.
Each object:
{
  "review_id": "<id>",
  "sentiment": "positive" | "neutral" | "negative",
  "summary":   "<a single sentence, max 12 words, capturing the gist>"
}

Sentiment definitions:
- "positive"  — happy, satisfied, would recommend
- "neutral"   — mixed feelings, qualified praise, or minor complaints alongside praise
- "negative"  — disappointed, frustrated, explicit warning, or would not return

Summary rules:
- Active voice, third person, focused on the customer's experience
- No quoting, no greetings, no "the customer says"
- Examples: "Praises fast next-day AC install", "Frustrated by missed appointment window",
  "Mixed: thorough work but pricey"
- Max 12 words

Reviews:
${reviews.map((r) => `{ "review_id": "${r.review_id}", "body": "${r.body.replace(/"/g, "'")}" }`).join("\n")}`;

  try {
    console.log(`[sentiment] analyzing ${reviews.length} reviews with Gemini`);
    const response = await model.generateContent(prompt);
    const raw = response.response.text().trim();

    const parsed = JSON.parse(raw) as { review_id: string; sentiment: string; summary?: string }[];

    for (const item of parsed) {
      const s = item.sentiment as Sentiment;
      if (s === "positive" || s === "neutral" || s === "negative") {
        const summary = typeof item.summary === "string" && item.summary.trim()
          ? item.summary.trim().slice(0, 200)
          : null;
        result.set(item.review_id, { sentiment: s, summary });
      }
    }

    console.log(`[sentiment] classified ${result.size}/${reviews.length} reviews (with summaries)`);
  } catch (err) {
    console.error("[sentiment] Gemini batch failed — falling back to rating heuristic:", err);
  }

  return result;
}

/**
 * Backwards-compatible thin wrapper around analyzeReviews — returns just the
 * sentiment so existing callers don't have to change.
 */
export async function analyzeSentiments(
  reviews: ReviewInput[],
): Promise<Map<string, Sentiment>> {
  const full = await analyzeReviews(reviews);
  const out = new Map<string, Sentiment>();
  for (const [id, val] of full) out.set(id, val.sentiment);
  return out;
}
