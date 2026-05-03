import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  // In production Vercel sits behind a load balancer — `origin` resolves to an
  // internal URL. x-forwarded-host contains the real public hostname the
  // browser used, so session cookies are scoped to the right domain.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const baseUrl =
    process.env.NODE_ENV === "development" || !forwardedHost
      ? origin
      : `https://${forwardedHost}`;

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/auth/error`);
  }

  // Collect cookies set by exchangeCodeForSession into this array so we can
  // stamp them onto whichever redirect response we end up returning.
  // We can't use next/headers cookieStore here because NextResponse.redirect()
  // is a separate response object — cookies written to cookieStore would be
  // silently discarded and the browser would never receive them.
  const pendingCookies: { name: string; value: string; options: Record<string, unknown> }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.headers
            .get("cookie")
            ?.split(";")
            .map((c) => {
              const [name, ...rest] = c.trim().split("=");
              return { name: name.trim(), value: rest.join("=") };
            }) ?? [];
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            pendingCookies.push({ name, value, options: options ?? {} })
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchangeCodeForSession error:", error.message);
    return NextResponse.redirect(`${baseUrl}/auth/error`);
  }

  // Resolve final redirect destination.
  let destination: string;

  if (next) {
    destination = `${baseUrl}${next}`;
  } else {
    // Detect new vs returning user: new users have no profiles row yet.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("user_id", user!.id)
      .maybeSingle();

    destination = `${baseUrl}${profile?.user_id ? "/dashboard" : "/onboarding"}`;
  }

  // Build the redirect and stamp all session cookies onto it.
  const response = NextResponse.redirect(destination);
  pendingCookies.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
  );

  return response;
}
