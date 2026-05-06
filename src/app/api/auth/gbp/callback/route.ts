import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const redirect = (err: string) =>
    NextResponse.redirect(`${APP_URL}/reviews?error=${err}`);

  if (error) {
    console.error("[gbp/callback] OAuth provider returned error:", error, searchParams.get("error_description"));
    return redirect("oauth_denied");
  }
  if (!code || !state) {
    console.error("[gbp/callback] missing code or state. raw query:", request.nextUrl.search);
    return redirect("oauth_invalid");
  }

  // Verify CSRF state
  const storedState = request.cookies.get("gbp_oauth_state")?.value;
  if (!storedState || storedState !== state) return redirect("oauth_csrf");

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${APP_URL}/api/auth/gbp/callback`,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    console.error("[gbp/callback] token exchange failed:", await tokenRes.text());
    return redirect("token_exchange_failed");
  }

  const tokens = await tokenRes.json() as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope: string;
  };

  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  // Verify user session
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("no_session");

  // Resolve the first GBP account + location for this user
  let accountName: string | null = null;
  let locationName: string | null = null;

  try {
    const accountsRes = await fetch(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    );
    if (accountsRes.ok) {
      const accountsData = await accountsRes.json() as { accounts?: { name: string }[] };
      accountName = accountsData.accounts?.[0]?.name ?? null;
    }

    if (accountName) {
      const locRes = await fetch(
        `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name`,
        { headers: { Authorization: `Bearer ${tokens.access_token}` } }
      );
      if (locRes.ok) {
        const locData = await locRes.json() as { locations?: { name: string }[] };
        locationName = locData.locations?.[0]?.name ?? null;
      }
    }
  } catch (err) {
    // Non-fatal: we store tokens even if account/location lookup fails.
    // The reviews page will retry on next load.
    console.error("[gbp/callback] account/location lookup failed:", err);
  }

  // Upsert integration record
  const { error: dbError } = await supabase
    .from("integrations")
    .upsert(
      {
        user_id: user.id,
        provider: "google_business_profile",
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? null,
        expires_at: expiresAt,
        scope: tokens.scope,
        account_name: accountName,
        location_name: locationName,
      },
      { onConflict: "user_id,provider" }
    );

  if (dbError) {
    console.error("[gbp/callback] db upsert failed:", dbError);
    return redirect("db_error");
  }

  const response = NextResponse.redirect(`${APP_URL}/reviews`);
  // Clear the CSRF cookie
  response.cookies.set("gbp_oauth_state", "", { maxAge: 0, path: "/" });
  return response;
}
