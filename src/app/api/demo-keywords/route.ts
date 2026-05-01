import { GoogleGenerativeAI } from "@google/generative-ai";
import type { NextRequest } from "next/server";

// In-memory IP rate limiter — resets on cold start.
// Acceptable for a public demo endpoint; migrate to Supabase table for persistence.
const IP_LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const ipStore = new Map<string, { count: number; resetsAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = ipStore.get(ip);
  if (!record || now > record.resetsAt) {
    ipStore.set(ip, { count: 1, resetsAt: now + WINDOW_MS });
    return false;
  }
  if (record.count >= IP_LIMIT) return true;
  record.count++;
  return false;
}

function fallbackKeywords(city: string): string[] {
  return [
    `HVAC repair ${city}`,
    `AC repair ${city}`,
    `heating and cooling ${city}`,
    `emergency HVAC service ${city}`,
    `air conditioning installation ${city}`,
    `furnace repair ${city}`,
    `HVAC maintenance ${city}`,
    `central air repair ${city}`,
    `AC tune-up ${city}`,
    `heat pump repair ${city}`,
    `HVAC contractor ${city}`,
    `same day AC repair ${city}`,
  ];
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    const body = await request.json().catch(() => ({}));
    const city =
      typeof body.city === "string" && body.city.trim().length >= 2
        ? body.city.trim()
        : null;

    if (!city) {
      return Response.json(
        { error: "city is required (min 2 characters)." },
        { status: 400 }
      );
    }

    // Return fallback on rate limit — demo still works, just uses static keywords
    if (isRateLimited(ip)) {
      return Response.json({ keywords: fallbackKeywords(city), demo: true });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ keywords: fallbackKeywords(city), demo: true });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite-preview",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = [
      `Return ONLY a raw JSON array of 12 HVAC SEO keyword strings.`,
      `No markdown. No code fences. No explanation. No extra text.`,
      `Just the array, starting with [ and ending with ].`,
      ``,
      `Business: "HVAC Services"`,
      `Location: "${city}"`,
      ``,
      `Rules:`,
      `- Mix short-tail and long-tail keywords`,
      `- Include "${city}" in at least 5 keywords`,
      `- Cover: AC repair, heating, installation, maintenance, emergency HVAC`,
      `- Include at least one seasonal keyword`,
    ].join("\n");

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();
    const cleaned = rawText
      .replace(/^```(?:json)?[\r\n]*/i, "")
      .replace(/[\r\n]*```$/i, "")
      .trim();

    let keywords: string[];
    try {
      const parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed)) throw new Error("not array");
      keywords = parsed.filter(
        (k): k is string => typeof k === "string" && k.trim().length > 0
      );
    } catch {
      keywords = cleaned
        .split(/[\n,]+/)
        .map((k) => k.replace(/^[\s\-*"'[]+|[\s\-*"'\]]+$/g, "").trim())
        .filter(Boolean);
    }

    return Response.json({ keywords });
  } catch (error) {
    console.error("[demo-keywords] unhandled error:", error);
    return Response.json(
      { error: "Failed to generate demo keywords. Please try again." },
      { status: 500 }
    );
  }
}
