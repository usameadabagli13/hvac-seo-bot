/**
 * Google Business Profile API service.
 * Server-only — never import from client components.
 *
 * Setup required:
 *  1. Enable in Google Cloud Console:
 *     - My Business Account Management API
 *     - My Business Business Information API
 *     - My Business API (v4, for reviews)
 *  2. Add authorized redirect URI:
 *     http://localhost:3000/api/auth/gbp/callback   (dev)
 *     https://yourdomain.com/api/auth/gbp/callback  (prod)
 *  3. Set env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXT_PUBLIC_APP_URL
 */

import { createClient } from "@/utils/supabase/server";
import type { Review } from "@/components/app/ReviewFeed";

// ── Token management ──────────────────────────────────────────────────────────

async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
} | null> {
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });
    if (!res.ok) {
      console.error("[gbp] token refresh failed:", await res.text());
      return null;
    }
    return res.json();
  } catch (err) {
    console.error("[gbp] token refresh error:", err);
    return null;
  }
}

// Returns a valid access token, refreshing if needed. Returns null on failure.
async function getValidToken(userId: string): Promise<string | null> {
  const supabase = await createClient();

  const { data: integration, error } = await supabase
    .from("integrations")
    .select("access_token, refresh_token, expires_at")
    .eq("user_id", userId)
    .eq("provider", "google_business_profile")
    .single();

  if (error || !integration) return null;

  // Refresh if token expires within 5 minutes
  const expiresAt = new Date(integration.expires_at).getTime();
  const needsRefresh = expiresAt - Date.now() < 5 * 60 * 1000;

  if (!needsRefresh) return integration.access_token;
  if (!integration.refresh_token) return null;

  const refreshed = await refreshAccessToken(integration.refresh_token);
  if (!refreshed) return null;

  const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();

  await supabase
    .from("integrations")
    .update({ access_token: refreshed.access_token, expires_at: newExpiresAt })
    .eq("user_id", userId)
    .eq("provider", "google_business_profile");

  return refreshed.access_token;
}

// ── GBP resource resolution ───────────────────────────────────────────────────

// If location_name was not captured during OAuth callback, resolve it now.
async function resolveLocationName(
  userId: string,
  accessToken: string
): Promise<string | null> {
  const supabase = await createClient();

  try {
    const accountsRes = await fetch(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!accountsRes.ok) return null;

    const accountsData = await accountsRes.json() as { accounts?: { name: string }[] };
    const accountName = accountsData.accounts?.[0]?.name;
    if (!accountName) return null;

    const locRes = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!locRes.ok) return null;

    const locData = await locRes.json() as { locations?: { name: string }[] };
    const locationName = locData.locations?.[0]?.name ?? null;

    if (locationName) {
      await supabase
        .from("integrations")
        .update({ account_name: accountName, location_name: locationName })
        .eq("user_id", userId)
        .eq("provider", "google_business_profile");
    }

    return locationName;
  } catch (err) {
    console.error("[gbp] resolveLocationName error:", err);
    return null;
  }
}

// ── Review conversion ─────────────────────────────────────────────────────────

const STAR_MAP: Record<string, 1 | 2 | 3 | 4 | 5> = {
  ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5,
};

function sentimentFromRating(rating: number): "positive" | "neutral" | "negative" {
  if (rating >= 4) return "positive";
  if (rating === 3) return "neutral";
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

function convertReview(raw: GBPReview, businessName: string): Review {
  const rating = STAR_MAP[raw.starRating] ?? 3;
  return {
    id: raw.reviewId,
    author: raw.reviewer.displayName,
    platform: "Google",
    rating,
    body: raw.comment ?? "(no review text)",
    date: raw.createTime.split("T")[0],
    sentiment: sentimentFromRating(rating),
    replied: !!raw.reviewReply,
    businessName,
  };
}

// ── Reply posting ─────────────────────────────────────────────────────────────

export interface PostReplyResult {
  ok: boolean;
  error?: string;
}

/**
 * Posts a reply to a GBP review via the My Business API v4.
 * Returns { ok: true } on success or { ok: false, error } on failure.
 */
export async function postGBPReviewReply(
  userId: string,
  reviewId: string,
  replyText: string,
): Promise<PostReplyResult> {
  const supabase = await createClient();

  const accessToken = await getValidToken(userId);
  if (!accessToken) {
    return { ok: false, error: "Google Business Profile not connected or token expired." };
  }

  const { data: integration } = await supabase
    .from("integrations")
    .select("location_name")
    .eq("user_id", userId)
    .eq("provider", "google_business_profile")
    .single();

  if (!integration?.location_name) {
    return { ok: false, error: "GBP location not found. Reconnect Google Business Profile." };
  }

  const url = `https://mybusiness.googleapis.com/v4/${integration.location_name}/reviews/${reviewId}/reply`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ comment: replyText }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
    const msg = err.error?.message ?? `GBP API error (${res.status})`;
    console.error("[gbp] postReply failed:", msg);
    return { ok: false, error: msg };
  }

  return { ok: true };
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface GBPStatus {
  connected: boolean;
  accountName: string | null;
  locationName: string | null;
}

/** Check whether the user has a connected GBP integration. */
export async function getGBPStatus(userId: string): Promise<GBPStatus> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("integrations")
    .select("account_name, location_name")
    .eq("user_id", userId)
    .eq("provider", "google_business_profile")
    .single();

  return {
    connected: !!data,
    accountName: data?.account_name ?? null,
    locationName: data?.location_name ?? null,
  };
}

/**
 * Fetch reviews from GBP for the user's first connected location.
 * Returns null if not connected, token is invalid, or the API errors.
 */
export async function getGBPReviews(userId: string): Promise<Review[] | null> {
  const supabase = await createClient();

  const accessToken = await getValidToken(userId);
  if (!accessToken) return null;

  // Get stored location_name, resolving it lazily if missing
  const { data: integration } = await supabase
    .from("integrations")
    .select("location_name, account_name")
    .eq("user_id", userId)
    .eq("provider", "google_business_profile")
    .single();

  if (!integration) return null;

  let locationName = integration.location_name as string | null;
  if (!locationName) {
    locationName = await resolveLocationName(userId, accessToken);
    if (!locationName) return null;
  }

  try {
    const res = await fetch(
      `https://mybusiness.googleapis.com/v4/${locationName}/reviews?pageSize=50`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!res.ok) {
      console.error("[gbp] reviews fetch failed:", res.status, await res.text());
      return null;
    }

    const data = await res.json() as { reviews?: GBPReview[] };
    const businessName = locationName.split("/").slice(0, 2).join("/"); // "accounts/ID"

    return (data.reviews ?? []).map((r) => convertReview(r, businessName));
  } catch (err) {
    console.error("[gbp] getGBPReviews error:", err);
    return null;
  }
}
