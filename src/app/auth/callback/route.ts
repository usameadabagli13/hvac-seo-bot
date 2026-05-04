import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next");

  if (!code) {
    console.error(
      "[auth/callback] No code param — check Supabase dashboard: Authentication → URL Configuration → Redirect URLs must include https://heatrankai.com/auth/callback"
    );
    return NextResponse.redirect(new URL("/auth/error", request.url));
  }

  // next/headers cookies() is the canonical way to read request cookies
  // in Next.js App Router route handlers — it handles chunked / encoded
  // cookies the same way the framework does internally.
  const cookieStore = await cookies();

  // Debug log: lets us verify the PKCE code_verifier cookie is present
  const cookieNames = cookieStore.getAll().map((c) => c.name);
  console.log("[auth/callback] incoming cookies:", cookieNames.join(", ") || "(none)");
  console.log("[auth/callback] supabase url set:", Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL));

  // Collect every Set-Cookie Supabase wants to write during the exchange.
  // We stamp them onto the redirect response so the browser receives
  // the session cookies in one round-trip.
  const pendingCookies: Array<{
    name: string;
    value: string;
    options: Record<string, unknown>;
  }> = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          // Collect for explicit response stamping (belt)
          pendingCookies.push(...cookiesToSet);
          // Also write via next/headers so Next.js includes them in any
          // response it builds internally (suspenders)
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(
                name,
                value,
                options as Parameters<typeof cookieStore.set>[2]
              );
            } catch {
              // next/headers set() may throw outside a mutable context;
              // the explicit response.cookies.set() below is the real path.
            }
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchangeCodeForSession failed:", {
      message: error.message,
      name: error.name,
      status: (error as { status?: number }).status,
    });
    return NextResponse.redirect(new URL("/auth/error", request.url));
  }

  console.log(
    "[auth/callback] exchange succeeded, setting",
    pendingCookies.length,
    "cookie(s)"
  );

  const destination = next ?? "/dashboard";
  const response = NextResponse.redirect(new URL(destination, request.url));

  // Explicitly stamp session cookies onto the redirect response —
  // this is the most reliable path in Next.js App Router.
  for (const { name, value, options } of pendingCookies) {
    response.cookies.set(
      name,
      value,
      options as Parameters<typeof response.cookies.set>[2]
    );
  }

  return response;
}
