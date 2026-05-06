import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  MessageSquare,
  Map,
  FileSearch,
  Users,
  FileText,
  ChevronRight,
  Zap,
  Shield,
  Clock,
} from "lucide-react";
import DemoWidget from "@/components/marketing/DemoWidget";
import FaqAccordion from "@/components/marketing/FaqAccordion";
import PricingToggle from "@/components/marketing/PricingToggle";
import WaitlistForm from "@/components/marketing/WaitlistForm";
import { PLANS } from "@/lib/plans";

export const revalidate = 3600;

// ─────────────────────────────────────────────────────────────────────────────
// Static data — defined outside the component so the module is tree-shaken
// ─────────────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Keyword Research",
    desc: "Generate 12 hyper-local HVAC keywords tailored to your city in under 30 seconds.",
  },
  {
    icon: MessageSquare,
    title: "Review Reply AI",
    desc: "Get 3 professional reply variants for every Google review. Pick one, post it, done.",
  },
  {
    icon: Map,
    title: "Local Rank Heatmap",
    desc: "See exactly where you rank across a 5×5 grid around your business on Google Maps.",
  },
  {
    icon: FileSearch,
    title: "On-Page SEO Audit",
    desc: "Instant checklist of critical, warning, and info-level issues on every page of your site.",
  },
  {
    icon: Users,
    title: "Competitor Spy",
    desc: "Track your top rivals' ratings, review count, and keyword gaps — updated weekly.",
  },
  {
    icon: FileText,
    title: "Automated Reports",
    desc: "PDF summaries of your rankings, reviews, and SEO score delivered every Monday.",
  },
];

const TESTIMONIALS = [
  {
    initials: "MT",
    name: "Mike T.",
    company: "Comfort Air HVAC, Dallas TX",
    quote:
      "Used to take a whole afternoon to research keywords. Now I generate 12 great ones in seconds. The ROI is insane.",
  },
  {
    initials: "SK",
    name: "Sarah K.",
    company: "Arctic Cool Services, Phoenix AZ",
    quote:
      "The review reply AI is my favorite feature. My response time dropped from days to minutes — customers notice.",
  },
  {
    initials: "JR",
    name: "James R.",
    company: "ProClimate HVAC, Houston TX",
    quote:
      "First month using the rank tracker, I could see exactly which keywords needed work. Rankings improved in 6 weeks.",
  },
];

const TRUST_SIGNALS = [
  { icon: Shield, label: "SOC 2 compliant infrastructure" },
  { icon: Clock, label: "Set up in under 3 minutes" },
  { icon: Zap, label: "First keywords in 30 seconds" },
];

// ─────────────────────────────────────────────────────────────────────────────

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Safety net: if Supabase's redirect URL is misconfigured it sends the
  // OAuth code to the site root instead of /auth/callback. Forward it.
  const params = await searchParams;
  if (params.code) {
    redirect(`/auth/callback?code=${params.code}`);
  }

  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Ambient glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-zinc-700/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-zinc-800/10 rounded-full blur-[120px]" />
      </div>

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <header className="relative border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/heatrank-logo.png"
              alt="HeatRank AI"
              width={36}
              height={36}
              className="rounded-xl w-9 h-9"
              priority
            />
            <span className="text-base font-semibold tracking-tight leading-none">
              <span className="text-zinc-100">HeatRank</span>
              <span className="text-zinc-400"> AI</span>
            </span>
          </Link>

          <nav className="flex items-center gap-5">
            <Link
              href="#features"
              className="hidden sm:block text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="hidden sm:block text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100 active:scale-[0.98] transition-all duration-150 shadow-sm"
            >
              Start Free Trial
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative">
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs text-zinc-400 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            14-day free trial — no credit card required
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-zinc-100 tracking-tight leading-[1.1] mb-6 max-w-3xl mx-auto">
            Stop Losing Customers to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-500">
              Competitors on Google
            </span>
          </h1>

          <p className="text-lg text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed">
            AI-powered local SEO tools built for HVAC contractors. Generate
            keywords, manage reviews, and track your Google rankings — without an
            agency.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 active:scale-[0.98] transition-all duration-150 shadow-lg shadow-black/20"
            >
              Start Free Trial — No Card Required
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="#demo"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/[0.10] bg-white/[0.03] text-zinc-300 font-medium text-sm hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-150"
            >
              See a live demo
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {TRUST_SIGNALS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs text-zinc-600">
                <Icon className="w-3.5 h-3.5" />
                {label}
              </div>
            ))}
          </div>
        </section>

        {/* ── Live Demo Widget ────────────────────────────────────────────────── */}
        <section id="demo" className="max-w-2xl mx-auto px-6 pb-24 scroll-mt-20">
          <div className="text-center mb-6">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2">
              Try it now — no sign-up
            </p>
            <h2 className="text-2xl font-semibold text-zinc-100 tracking-tight">
              See your keywords in 30 seconds
            </h2>
            <p className="text-sm text-zinc-500 mt-2">
              Enter your city and watch real AI-generated HVAC keywords appear.
            </p>
          </div>
          <DemoWidget />
        </section>

        {/* ── Features ────────────────────────────────────────────────────────── */}
        <section id="features" className="max-w-6xl mx-auto px-6 pb-24 scroll-mt-20">
          <div className="text-center mb-12">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2">
              Everything you need
            </p>
            <h2 className="text-3xl font-bold text-zinc-100 tracking-tight">
              One tool. Every local SEO problem solved.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-white/[0.10] hover:bg-white/[0.03] transition-all duration-200"
              >
                <div className="w-9 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] flex items-center justify-center mb-4">
                  <Icon className="w-4 h-4 text-zinc-300" />
                </div>
                <h3 className="text-base font-semibold text-zinc-100 mb-1.5">
                  {title}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Pricing ─────────────────────────────────────────────────────────── */}
        <section id="pricing" className="max-w-6xl mx-auto px-6 pb-24 scroll-mt-20">
          <div className="text-center mb-12">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2">
              Simple pricing
            </p>
            <h2 className="text-3xl font-bold text-zinc-100 tracking-tight mb-3">
              14 days free. Then pick your plan.
            </h2>
            <p className="text-sm text-zinc-500 max-w-md mx-auto">
              No credit card required to start. Upgrade, downgrade, or cancel anytime.
            </p>
          </div>

          <PricingToggle plans={PLANS} />
        </section>

        {/* ── Testimonials ────────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="text-center mb-12">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2">
              Trusted by contractors
            </p>
            <h2 className="text-3xl font-bold text-zinc-100 tracking-tight">
              Real results from real HVAC owners
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TESTIMONIALS.map(({ initials, name, company, quote }) => (
              <div
                key={name}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 flex flex-col gap-4"
              >
                <p className="text-sm text-zinc-400 leading-relaxed flex-1">
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300 select-none flex-shrink-0">
                    {initials}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-300">{name}</p>
                    <p className="text-[11px] text-zinc-600">{company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
        <section className="max-w-2xl mx-auto px-6 pb-24">
          <div className="text-center mb-10">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2">
              FAQ
            </p>
            <h2 className="text-3xl font-bold text-zinc-100 tracking-tight">
              Common questions
            </h2>
          </div>
          <FaqAccordion />
        </section>

        {/* ── Bottom CTA ──────────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] px-8 py-16 text-center">
            <h2 className="text-3xl font-bold text-zinc-100 tracking-tight mb-3">
              Ready to rank higher?
            </h2>
            <p className="text-zinc-500 text-sm mb-8 max-w-md mx-auto leading-relaxed">
              Join HVAC contractors who are winning local search with AI. Start
              your 14-day free trial — no credit card required.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 active:scale-[0.98] transition-all duration-150 shadow-lg shadow-black/20"
            >
              Start your 14-day free trial
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* ── Founding Member offer ────────────────────────────────────────── */}
        <section className="max-w-3xl mx-auto px-6 pt-4 pb-20">
          <div className="rounded-3xl border border-amber-500/15 bg-gradient-to-br from-amber-500/[0.06] via-white/[0.02] to-white/[0.02] px-6 py-8 sm:px-10 sm:py-10">
            <div className="mb-5">
              <p className="text-xs font-medium text-amber-400 uppercase tracking-widest mb-2">
                Limited offer
              </p>
              <h3 className="text-xl font-semibold text-zinc-100 tracking-tight mb-1.5">
                Become a founding member — 30% off your first year
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                The first 20 HVAC contractors to claim a spot get <strong className="text-zinc-300">30% off
                the Pro plan for 12 months</strong>, plus a permanent <strong className="text-zinc-300">★ Founder
                badge</strong> on their account — priority support and early access to every new feature,
                forever. Once the spots are gone, founder status closes for good.
              </p>
            </div>
            <WaitlistForm />
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Image
              src="/heatrank-logo.png"
              alt="HeatRank AI"
              width={20}
              height={20}
              className="rounded-xl w-5 h-5 opacity-60"
            />
            <span className="text-sm text-zinc-500 font-medium">HeatRank AI</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-zinc-600">
            <Link href="/pricing" className="hover:text-zinc-400 transition-colors">
              Pricing
            </Link>
            <Link href="/privacy" className="hover:text-zinc-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-zinc-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/login" className="hover:text-zinc-400 transition-colors">
              Sign In
            </Link>
          </div>

          <p className="text-xs text-zinc-700">
            © {year} HeatRank AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
