import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  // In production Vercel sits behind a load balancer. `origin` resolves to an
  // internal URL, not the real domain. x-forwarded-host contains the actual
  // public hostname the browser used — use it in production so session cookies
  // are scoped to the right domain and the redirect lands on the right URL.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const baseUrl =
    process.env.NODE_ENV === "development" || !forwardedHost
      ? origin
      : `https://${forwardedHost}`;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (next) return NextResponse.redirect(`${baseUrl}${next}`);

      // Detect new vs returning user: new users have no profiles row yet.
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", user!.id)
        .maybeSingle();

      const destination = profile ? "/dashboard" : "/onboarding";
      return NextResponse.redirect(`${baseUrl}${destination}`);
    }
  }

  return NextResponse.redirect(`${baseUrl}/auth/error`);
}
