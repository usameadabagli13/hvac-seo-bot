"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export default function LoginPage() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail]               = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSent, setEmailSent]       = useState(false);
  const [emailError, setEmailError]     = useState<string | null>(null);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) window.location.replace(`/auth/callback?code=${code}`);
  }, []);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: "select_account" },
      },
    });
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;

    setEmailLoading(true);
    setEmailError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setEmailLoading(false);

    if (error) {
      setEmailError(error.message);
    } else {
      setEmailSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-zinc-800/20 rounded-full blur-[128px]" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
            <Image src="/heatrank-logo.png" alt="HeatRank AI" width={36} height={36} className="rounded-xl w-9 h-9" />
            <span className="text-base font-semibold tracking-tight">
              <span className="text-zinc-100">HeatRank</span>
              <span className="text-zinc-500"> AI</span>
            </span>
          </Link>
          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">
            {emailSent ? "Check your inbox" : "Sign in or create account"}
          </h1>
          <p className="text-sm text-zinc-500 mt-1.5">
            {emailSent
              ? `We sent a magic link to ${email}`
              : "14-day free trial — no credit card required"}
          </p>
        </div>

        {emailSent ? (
          /* ── Magic link sent state ── */
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <MailIcon className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed mb-5">
              Click the link in your email to sign in. It expires in 1 hour.
            </p>
            <button
              onClick={() => { setEmailSent(false); setEmail(""); }}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              Use a different email
            </button>
          </div>
        ) : (
          /* ── Login form ── */
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm space-y-3">

            {/* Google */}
            <button
              id="google-sign-in-button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || emailLoading}
              className="w-full flex items-center justify-center gap-3 h-11 rounded-lg bg-white text-zinc-900 text-sm font-medium hover:bg-zinc-100 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:pointer-events-none"
            >
              {googleLoading ? (
                <div className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin" />
              ) : (
                <>
                  <GoogleIcon className="w-4 h-4" />
                  Continue with Google
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-[11px] text-zinc-600">or</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            {/* Email magic link */}
            <form onSubmit={handleEmailLogin} className="space-y-2.5">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
                placeholder="you@example.com"
                required
                disabled={emailLoading}
                className="w-full h-11 px-4 rounded-lg bg-white/[0.03] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all disabled:opacity-50"
              />
              {emailError && (
                <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                  {emailError}
                </p>
              )}
              <button
                type="submit"
                disabled={emailLoading || !email.trim() || googleLoading}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-lg border border-white/[0.10] bg-white/[0.03] text-zinc-300 text-sm font-medium hover:bg-white/[0.06] hover:border-white/[0.15] active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none"
              >
                {emailLoading ? (
                  <div className="w-4 h-4 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
                ) : (
                  <>
                    <MailIcon className="w-4 h-4" />
                    Continue with Email
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-zinc-600 pt-1">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-zinc-400 transition-colors">Terms</Link>
              {" "}and{" "}
              <Link href="/privacy" className="underline hover:text-zinc-400 transition-colors">Privacy Policy</Link>
            </p>
          </div>
        )}

        <p className="text-center text-xs text-zinc-700 mt-6">
          Secured by Supabase Auth
        </p>
      </div>
    </div>
  );
}
