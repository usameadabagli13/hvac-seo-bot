import { GoogleGenerativeAI } from "@google/generative-ai";

interface ReviewInput {
  review_id: string;
  body: string;
}

type Sentiment = "positive" | "neutral" | "negative";

/**
 * Classifies the sentiment of multiple reviews in a single Gemini batch call.
 * Returns a Map of review_id → sentiment. Falls back silently on API errors
 * so callers can still upsert with a rating-based default.
 */
export async function analyzeSentiments(
  reviews: ReviewInput[]
): Promise<Map<string, Sentiment>> {
  const result = new Map<string, Sentiment>();
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

  const prompt = `You are analyzing HVAC customer reviews for sentiment classification.

Return ONLY a JSON array — one object per review in the same order.
Each object: { "review_id": "<id>", "sentiment": "positive" | "neutral" | "negative" }

Definitions:
- "positive"  — customer is happy, satisfied, or would recommend
- "neutral"   — mixed feelings, qualified praise, or minor complaints alongside praise
- "negative"  — disappointed, frustrated, explicit warning to others, or would not return

Reviews to classify:
${reviews.map((r) => `{ "review_id": "${r.review_id}", "body": "${r.body.replace(/"/g, "'")} }`).join("\n")}`;

  try {
    console.log(`[sentiment] analyzing ${reviews.length} reviews with Gemini`);
    const response = await model.generateContent(prompt);
    const raw = response.response.text().trim();

    const parsed = JSON.parse(raw) as { review_id: string; sentiment: string }[];

    for (const item of parsed) {
      const s = item.sentiment as Sentiment;
      if (s === "positive" || s === "neutral" || s === "negative") {
        result.set(item.review_id, s);
      }
    }

    console.log(`[sentiment] classified ${result.size}/${reviews.length} reviews`);
  } catch (err) {
    console.error("[sentiment] Gemini batch failed — falling back to rating heuristic:", err);
  }

  return result;
}
