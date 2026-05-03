import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // If caller specified an explicit `next`, honour it (e.g. password reset).
      if (next) return NextResponse.redirect(`${origin}${next}`);

      // Detect new vs returning user: new users have no profiles row yet.
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", user!.id)
        .maybeSingle();

      const destination = profile ? "/dashboard" : "/onboarding";
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`);
}
