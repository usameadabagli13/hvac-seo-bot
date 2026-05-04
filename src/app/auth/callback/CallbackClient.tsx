"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function CallbackClient() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const next = searchParams.get("next");

    console.log("[auth/callback] page loaded", {
      hasCode: Boolean(code),
      next,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    });

    if (!code) {
      console.error("[auth/callback] No code in URL — Supabase may have redirected to the wrong URL. Check Supabase dashboard → Authentication → URL Configuration → Redirect URLs includes your production callback URL.");
      window.location.replace("/auth/error");
      return;
    }

    (async () => {
      try {
        const supabase = createClient();

        console.log("[auth/callback] calling exchangeCodeForSession…");
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error("[auth/callback] exchangeCodeForSession failed:", error.message, error);
          window.location.replace("/auth/error");
          return;
        }

        console.log("[auth/callback] exchange succeeded");

        if (next) {
          window.location.replace(next);
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          console.error("[auth/callback] getUser returned null after successful exchange");
          window.location.replace("/auth/error");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();

        const destination = profile?.user_id ? "/dashboard" : "/onboarding";
        console.log("[auth/callback] redirecting to", destination);
        window.location.replace(destination);
      } catch (err) {
        console.error("[auth/callback] unexpected error:", err);
        window.location.replace("/auth/error");
      }
    })();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-zinc-400 text-sm">Signing you in…</div>
    </div>
  );
}
