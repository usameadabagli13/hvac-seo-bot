import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { validateUrl, normalizeUrl, InvalidUrlError } from "@/utils/url";

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

    const body = await request.json();
    const { websiteUrl } = body;

    if (!websiteUrl || typeof websiteUrl !== "string") {
      return Response.json({ error: "websiteUrl is required." }, { status: 400 });
    }

    // Validate before any network call — Critique #3 guard
    let validUrl: URL;
    try {
      validUrl = validateUrl(normalizeUrl(websiteUrl));
    } catch (err) {
      if (err instanceof InvalidUrlError) {
        return Response.json({ error: err.message }, { status: 422 });
      }
      throw err;
    }

    if (!["http:", "https:"].includes(validUrl.protocol)) {
      return Response.json(
        { error: "Only http and https URLs are supported." },
        { status: 422 }
      );
    }

    // Phase 5: robots.txt check → page fetch → Gemini SEO analysis goes here
    console.error("[crawl] crawler not yet implemented for:", validUrl.href);
    return Response.json(
      { message: "Crawler not yet implemented.", url: validUrl.href },
      { status: 501 }
    );
  } catch (error) {
    console.error("[crawl] unhandled error:", error);
    return Response.json(
      { error: "Failed to crawl. Please try again." },
      { status: 500 }
    );
  }
}
