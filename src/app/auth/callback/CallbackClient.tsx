"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function CallbackClient() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const next = searchParams.get("next");

    if (!code) {
      window.location.replace("/auth/error");
      return;
    }

    (async () => {
      const supabase = createClient();

      // Exchange the OAuth code for a session. The browser client writes the
      // resulting session tokens directly to document.cookie so they travel
      // with every subsequent request and the server can read them normally.
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        window.location.replace("/auth/error");
        return;
      }

      if (next) {
        window.location.replace(next);
        return;
      }

      // Detect new vs returning user.
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.replace("/auth/error");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      // Full navigation so the browser sends the fresh session cookies with
      // the next request — important for server components and middleware.
      window.location.replace(profile?.user_id ? "/dashboard" : "/onboarding");
    })();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-zinc-400 text-sm">Signing you in…</div>
    </div>
  );
}
