"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Shield, Check, Star, Clock, Zap, ArrowLeft } from "lucide-react";

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

const VALUE_PROPS = [
  { icon: Zap,    title: "First keywords in 30 seconds", desc: "AI generates 12 hyper-local HVAC keywords for your service area" },
  { icon: Star,   title: "Reply to every Google review", desc: "3 AI-drafted replies per review — pick one, post it, done" },
  { icon: Clock,  title: "5×5 rank heatmap",             desc: "See exactly where you rank across your city on Google Maps" },
];

export default function LoginPage() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail]                 = useState("");
  const [emailLoading, setEmailLoading]   = useState(false);
  const [emailSent, setEmailSent]         = useState(false);
  const [emailError, setEmailError]       = useState<string | null>(null);

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
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    setEmailLoading(false);

    if (error) {
      setEmailError(error.message);
    } else {
      setEmailSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-amber-500/[0.04] rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[400px] bg-zinc-700/10 rounded-full blur-[120px]" />
      </div>

      {/* Top bar with back link */}
      <header className="relative border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/heatrank-logo.png" alt="HeatRank AI" width={28} height={28} className="rounded-xl w-7 h-7" />
            <span className="text-sm font-semibold tracking-tight">
              <span className="text-zinc-100">HeatRank</span>
              <span className="text-zinc-500"> AI</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="relative flex-1 flex items-center justify-center px-5 sm:px-6 py-8 sm:py-16">
        <div className="w-full max-w-5xl grid lg:grid-cols-[1fr_1.05fr] gap-8 lg:gap-14 items-center">

          {/* ── Mobile: top hook (pill + headline + sub) ──────────────────── */}
          <div className="lg:hidden text-center max-w-md mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-200 mb-4">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-300">30-day money-back guarantee</span>
            </div>
            <h1 className="text-3xl font-bold text-zinc-100 tracking-tight leading-tight mb-3">
              Rank higher on Google.{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">
                Risk-free.
              </span>
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              14 days free, no credit card. Full refund if we don&apos;t move the needle in 30 days.
            </p>
          </div>

          {/* ── Desktop: full marketing column (left side) ────────────────── */}
          <div className="hidden lg:block lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-200 mb-5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-300">30-day money-back guarantee</span>
            </div>

            <h1 className="text-4xl font-bold text-zinc-100 tracking-tight leading-tight mb-3">
              Rank higher on Google.{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">
                Risk-free.
              </span>
            </h1>
            <p className="text-base text-zinc-400 leading-relaxed mb-8 max-w-md">
              14 days free, no credit card. Upgrade and we don&apos;t move the needle in 30 days?
              Email us for a full refund.
            </p>

            <ul className="space-y-3.5 mb-8">
              {VALUE_PROPS.map(({ icon: Icon, title, desc }) => (
                <li key={title} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-100 leading-tight">{title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-center gap-1 mb-2">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed mb-3 italic">
                &ldquo;First month using rank tracker, I saw exactly which keywords needed work. Rankings improved in 6 weeks.&rdquo;
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300 select-none flex-shrink-0">
                  JR
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-zinc-300 truncate">James R., ProClimate HVAC</p>
                  <p className="text-[10px] text-zinc-600 truncate">Houston, TX · More direct calls from GMB</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Login form (always middle on mobile, right on desktop) ────── */}
          <div className="lg:order-2 w-full max-w-md mx-auto lg:mx-0">
            <div className="text-center lg:text-left mb-6">
              <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">
                {emailSent ? "Check your inbox" : "Sign in or create account"}
              </h2>
              <p className="text-sm text-zinc-500 mt-1.5">
                {emailSent
                  ? `We sent a magic link to ${email}`
                  : "Start your 14-day free trial — no credit card."}
              </p>
            </div>

            {emailSent ? (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <MailIcon className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed mb-2">
                  Click the link in your email to sign in.
                </p>
                <p className="text-xs text-zinc-500 mb-5">
                  Link expires in 1 hour. Don&apos;t see it? Check your <span className="text-zinc-300 font-medium">Promotions</span> or <span className="text-zinc-300 font-medium">Junk</span> folder.
                </p>
                <button
                  onClick={() => { setEmailSent(false); setEmail(""); }}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors underline"
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-sm space-y-3 shadow-2xl shadow-black/30">
                {/* Google */}
                <button
                  id="google-sign-in-button"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading || emailLoading}
                  className="w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-white text-zinc-900 text-sm font-semibold hover:bg-zinc-100 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:pointer-events-none shadow-md"
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
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-white/[0.08]" />
                  <span className="text-[11px] text-zinc-600 font-medium">OR</span>
                  <div className="flex-1 h-px bg-white/[0.08]" />
                </div>

                {/* Email magic link */}
                <form onSubmit={handleEmailLogin} className="space-y-2.5">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
                    placeholder="you@yourhvac.com"
                    required
                    disabled={emailLoading}
                    className="w-full h-12 px-4 rounded-xl bg-zinc-900 border border-white/[0.08] text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-white/25 focus:ring-2 focus:ring-white/10 transition-all disabled:opacity-50"
                  />
                  {emailError && (
                    <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                      {emailError}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={emailLoading || !email.trim() || googleLoading}
                    className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border border-white/[0.12] bg-zinc-900 text-zinc-100 text-sm font-semibold hover:bg-zinc-800 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none"
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

                {/* Trust ticks */}
                <div className="pt-3 mt-1 border-t border-white/[0.05]">
                  <ul className="space-y-1.5">
                    {[
                      "14-day free trial — no credit card",
                      "30-day money-back guarantee",
                      "Cancel in two clicks, anytime",
                    ].map((t) => (
                      <li key={t} className="flex items-center gap-2 text-[11px] text-zinc-400">
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="text-center text-[11px] text-zinc-600 pt-1">
                  By continuing, you agree to our{" "}
                  <Link href="/terms" className="underline hover:text-zinc-400 transition-colors">Terms</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="underline hover:text-zinc-400 transition-colors">Privacy Policy</Link>
                </p>
              </div>
            )}

            <p className="text-center lg:text-left text-[11px] text-zinc-700 mt-5">
              🔒 Secured by Supabase Auth · SOC 2 Type II compliant
            </p>

            {/* ── Mobile-only details (value props + testimonial below the form) ── */}
            <div className="lg:hidden mt-10 space-y-6">
              <div>
                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest text-center mb-4">
                  What you get on day 1
                </p>
                <ul className="space-y-3.5">
                  {VALUE_PROPS.map(({ icon: Icon, title, desc }) => (
                    <li key={title} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-100 leading-tight">{title}</p>
                        <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex items-center gap-1 mb-2">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed mb-3 italic">
                  &ldquo;First month using rank tracker, I saw exactly which keywords needed work. Rankings improved in 6 weeks.&rdquo;
                </p>
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300 select-none flex-shrink-0">
                    JR
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-zinc-300 truncate">James R., ProClimate HVAC</p>
                    <p className="text-[10px] text-zinc-600 truncate">Houston, TX · More direct calls from GMB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
