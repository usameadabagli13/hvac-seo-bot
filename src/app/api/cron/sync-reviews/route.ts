import type { NextRequest } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { analyzeReviews } from "@/lib/sentiment";

/**
 * Daily cron: syncs Google reviews for every user who has a connected
 * Google Business Profile. Runs at 06:00 UTC via Vercel Cron.
 *
 * Uses the admin client (bypasses RLS) because there is no user session
 * in a cron context. Token refresh is handled inline.
 *
 * Auth: Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` automatically.
 */

const STAR_MAP: Record<string, 1 | 2 | 3 | 4 | 5> = {
  ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5,
};

function sentimentFromRating(r: number): "positive" | "neutral" | "negative" {
  if (r >= 4) return "positive";
  if (r === 3) return "neutral";
  return "negative";
}

interface GBPReview {
  reviewId: string;
  reviewer: { displayName: string };
  starRating: string;
  comment?: string;
  createTime: string;
  reviewReply?: { comment: string };
}

async function refreshAccessToken(
  refreshToken: string
): Promise<{ access_token: string; expires_in: number } | null> {
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id:     process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type:    "refresh_token",
      }),
    });
    if (!res.ok) {
      console.error("[cron/sync-reviews] token refresh failed:", await res.text());
      return null;
    }
    return res.json() as Promise<{ access_token: string; expires_in: number }>;
  } catch {
    return null;
  }
}

async function handle(request: NextRequest) {
  const expected = process.env.REVIEW_SYNC_SECRET;
  const got = request.headers.get("authorization");
  if (!expected || got !== `Bearer ${expected}`) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createAdminClient();

  // All users with a GBP integration that has a resolved location
  const { data: integrations, error: intErr } = await supabase
    .from("integrations")
    .select("user_id, access_token, refresh_token, expires_at, location_name")
    .eq("provider", "google_business_profile")
    .not("location_name", "is", null);

  if (intErr) {
    console.error("[cron/sync-reviews] integrations query failed:", intErr);
    return Response.json({ error: "DB query failed." }, { status: 500 });
  }

  if (!integrations?.length) {
    return Response.json({ ok: true, processed: 0, skipped: 0, errors: 0 });
  }

  let processed = 0;
  let skipped = 0;
  let errors = 0;

  for (const integration of integrations) {
    const uid = integration.user_id as string;

    try {
      // ── 1. Ensure a valid access token ──────────────────────────────────
      let accessToken = integration.access_token as string;
      const expiresAt = new Date(integration.expires_at as string).getTime();

      if (expiresAt - Date.now() < 5 * 60 * 1000) {
        if (!integration.refresh_token) {
          console.warn(`[cron/sync-reviews] no refresh token for user=${uid}, skipping`);
          skipped++;
          continue;
        }

        const refreshed = await refreshAccessToken(integration.refresh_token as string);
        if (!refreshed) {
          console.warn(`[cron/sync-reviews] token refresh failed for user=${uid}, skipping`);
          skipped++;
          continue;
        }

        accessToken = refreshed.access_token;
        const newExpiry = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();

        await supabase
          .from("integrations")
          .update({ access_token: accessToken, expires_at: newExpiry })
          .eq("user_id", uid)
          .eq("provider", "google_business_profile");
      }

      // ── 2. Fetch reviews from GBP ────────────────────────────────────────
      const gbpRes = await fetch(
        `https://mybusiness.googleapis.com/v4/${integration.location_name}/reviews?pageSize=50`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!gbpRes.ok) {
        console.error(`[cron/sync-reviews] GBP API error for user=${uid}:`, gbpRes.status, await gbpRes.text());
        errors++;
        continue;
      }

      const gbpData = await gbpRes.json() as { reviews?: GBPReview[] };
      const rawReviews = gbpData.reviews ?? [];

      if (rawReviews.length === 0) {
        processed++;
        continue;
      }

      // ── 3. Resolve the user's primary business ───────────────────────────
      const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!business) {
        console.warn(`[cron/sync-reviews] no business for user=${uid}, skipping`);
        skipped++;
        continue;
      }

      // ── 4. Sentiment analysis (batch Gemini call) ────────────────────────
      const analysisMap = await analyzeReviews(
        rawReviews.map((r) => ({ review_id: r.reviewId, body: r.comment ?? "" }))
      );

      // ── 5. Build rows and upsert ─────────────────────────────────────────
      const rows = rawReviews.map((r) => {
        const rating   = STAR_MAP[r.starRating] ?? 3;
        const analysis = analysisMap.get(r.reviewId);
        return {
          user_id:           uid,
          business_id:       business.id as string,
          platform:          "Google",
          review_id:         r.reviewId,
          author:            r.reviewer.displayName,
          rating,
          body:              r.comment ?? "(no review text)",
          sentiment:         analysis?.sentiment ?? sentimentFromRating(rating),
          sentiment_summary: analysis?.summary ?? null,
          review_date:       r.createTime.split("T")[0],
          fetched_at:        new Date().toISOString(),
        };
      });

      const { error: upsertErr } = await supabase
        .from("reviews")
        .upsert(rows, {
          onConflict:       "business_id,platform,review_id",
          ignoreDuplicates: false,
        });

      if (upsertErr) {
        console.error(`[cron/sync-reviews] upsert error for user=${uid}:`, upsertErr);
        errors++;
        continue;
      }

      console.log(`[cron/sync-reviews] user=${uid} synced ${rows.length} reviews`);
      processed++;
    } catch (err) {
      console.error(`[cron/sync-reviews] unexpected error for user=${uid}:`, err);
      errors++;
    }
  }

  console.log(`[cron/sync-reviews] done — processed=${processed} skipped=${skipped} errors=${errors}`);
  return Response.json({ ok: true, processed, skipped, errors });
}

export async function GET(request: NextRequest)  { return handle(request); }
export async function POST(request: NextRequest) { return handle(request); }
