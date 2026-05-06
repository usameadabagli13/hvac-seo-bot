import { GoogleGenerativeAI } from "@google/generative-ai";
import type { NextRequest } from "next/server";

const IP_LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;
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

function fallbackText(city: string): string {
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
  ].join("\n");
}

export async function POST(request: NextRequest) {
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

  const textResponse = (text: string) =>
    new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });

  if (isRateLimited(ip) || !process.env.GEMINI_API_KEY) {
    return textResponse(fallbackText(city));
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

  const prompt = [
    `Output exactly 12 HVAC SEO keyword phrases, one per line.`,
    `No numbering, no bullets, no extra text. Just keywords, one per line.`,
    ``,
    `Business: HVAC Services in "${city}"`,
    ``,
    `Rules:`,
    `- Mix short-tail and long-tail phrases`,
    `- Include "${city}" in at least 5 keywords`,
    `- Cover: AC repair, heating, installation, maintenance, emergency service`,
    `- Include at least one seasonal keyword`,
  ].join("\n");

  try {
    const result = await model.generateContentStream(prompt);

    const stream = new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder();
        let buffer = "";
        for await (const chunk of result.stream) {
          buffer += chunk.text();
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const kw = line.replace(/^[\s\-*•·\d.]+/, "").trim();
            if (kw) controller.enqueue(enc.encode(kw + "\n"));
          }
        }
        if (buffer.trim()) {
          const kw = buffer.replace(/^[\s\-*•·\d.]+/, "").trim();
          if (kw) controller.enqueue(new TextEncoder().encode(kw + "\n"));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("[demo-keywords] error:", error);
    return textResponse(fallbackText(city));
  }
}
