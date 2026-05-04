import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next");

  if (!code) {
    console.error(
      "[auth/callback] No code param — verify Supabase dashboard Redirect URLs includes https://heatrankai.com/auth/callback"
    );
    return NextResponse.redirect(new URL("/auth/error", request.url));
  }

  // Collect cookies Supabase wants to write during exchange
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
        // Give Supabase the incoming cookies so it can read the PKCE code_verifier
        getAll: () => request.cookies.getAll(),
        // Collect all Set-Cookie headers Supabase wants to send
        setAll: (cookies) => pendingCookies.push(...cookies),
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchangeCodeForSession failed:", error.message);
    return NextResponse.redirect(new URL("/auth/error", request.url));
  }

  // Build redirect and stamp session cookies onto it
  const destination = next ?? "/dashboard";
  const response = NextResponse.redirect(new URL(destination, request.url));

  for (const { name, value, options } of pendingCookies) {
    response.cookies.set(
      name,
      value,
      options as Parameters<typeof response.cookies.set>[2]
    );
  }

  return response;
}
