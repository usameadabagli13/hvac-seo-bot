import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Refreshes the access token using the stored refresh_token and updates the DB.
async function refreshAccessToken(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  refreshToken: string,
): Promise<string | null> {
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
    console.error("[google/accounts] token refresh failed:", await res.text());
    return null;
  }

  const tokens = await res.json() as { access_token: string; expires_in: number };
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  await supabase
    .from("integrations")
    .update({ access_token: tokens.access_token, expires_at: expiresAt })
    .eq("user_id", userId)
    .eq("provider", "google_business_profile");

  return tokens.access_token;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Load the stored GBP integration for this user
  const { data: integration } = await supabase
    .from("integrations")
    .select("access_token, refresh_token, expires_at")
    .eq("user_id", user.id)
    .eq("provider", "google_business_profile")
    .maybeSingle();

  if (!integration?.access_token) {
    return NextResponse.json(
      { error: "Google Business Profile not connected. Visit /api/auth/gbp to connect." },
      { status: 403 },
    );
  }

  // Refresh the token if it has expired (or expires within the next 60 seconds)
  let accessToken = integration.access_token;
  const expiresAt = integration.expires_at ? new Date(integration.expires_at) : null;
  const isExpired = !expiresAt || expiresAt.getTime() - Date.now() < 60_000;

  if (isExpired) {
    if (!integration.refresh_token) {
      return NextResponse.json(
        { error: "Access token expired and no refresh token available. Reconnect GBP." },
        { status: 403 },
      );
    }
    const refreshed = await refreshAccessToken(supabase, user.id, integration.refresh_token);
    if (!refreshed) {
      return NextResponse.json(
        { error: "Failed to refresh Google token. Reconnect GBP." },
        { status: 403 },
      );
    }
    accessToken = refreshed;
  }

  // Fetch accounts from Google Business Profile API
  const gbpRes = await fetch(
    "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  const gbpData = await gbpRes.json();

  if (!gbpRes.ok) {
    console.error("[google/accounts] GBP API error:", gbpData);
    return NextResponse.json(
      { error: gbpData.error?.message ?? "Failed to fetch GBP accounts." },
      { status: gbpRes.status },
    );
  }

  return NextResponse.json(gbpData);
}
