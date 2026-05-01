import Link from "next/link";
import {
  Sparkles,
  MessageSquare,
  Map,
  FileSearch,
  Users,
  FileText,
  Check,
  ChevronRight,
  Zap,
  Shield,
  Clock,
} from "lucide-react";
import DemoWidget from "@/components/marketing/DemoWidget";
import FaqAccordion from "@/components/marketing/FaqAccordion";

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

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    desc: "For contractors just getting started.",
    cta: "Start Free",
    ctaHref: "/login",
    highlight: false,
    features: [
      "1 business",
      "2 AI keyword generations / mo",
      "5 AI review replies / mo",
      "1 SEO audit / mo",
      "Monthly rank snapshot",
    ],
  },
  {
    name: "Pro",
    price: "$49",
    period: "/mo",
    desc: "For contractors serious about growth.",
    cta: "Start Free Trial",
    ctaHref: "/login",
    highlight: true,
    features: [
      "10 businesses",
      "Unlimited AI keyword generations",
      "Unlimited review replies",
      "Unlimited SEO audits",
      "Weekly rank snapshots",
      "Competitor tracking (3 rivals)",
      "Weekly PDF reports",
    ],
  },
  {
    name: "Agency",
    price: "$149",
    period: "/mo",
    desc: "For agencies managing multiple HVAC clients.",
    cta: "Contact Sales",
    ctaHref: "/login",
    highlight: false,
    features: [
      "Unlimited businesses",
      "Daily rank snapshots",
      "Competitor tracking (10 rivals)",
      "Daily PDF reports",
      "White-label reports",
      "Sub-account management",
      "Priority support",
    ],
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

export default function LandingPage() {
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
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-white/[0.05] border border-white/[0.10]">
              <Zap className="w-3.5 h-3.5 text-zinc-300" />
            </div>
            <span className="text-sm font-semibold text-zinc-100 tracking-tight">
              HVAC SEO Bot
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
              Start Free
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative">
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs text-zinc-400 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Now in beta — free plan, no card required
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
              Start Free — No Card Required
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
            <h2 className="text-3xl font-bold text-zinc-100 tracking-tight">
              Start free. Upgrade when you grow.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-6 flex flex-col ${
                  plan.highlight
                    ? "border-white/[0.18] bg-white/[0.04] ring-1 ring-white/[0.06]"
                    : "border-white/[0.06] bg-white/[0.02]"
                }`}
              >
                {plan.highlight && (
                  <span className="inline-flex w-fit items-center px-2 py-0.5 rounded-full border border-white/[0.12] bg-white/[0.07] text-[10px] font-semibold text-zinc-300 uppercase tracking-widest mb-4">
                    Most Popular
                  </span>
                )}
                <p className="text-sm font-medium text-zinc-400 mb-1">
                  {plan.name}
                </p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-bold text-zinc-100">
                    {plan.price}
                  </span>
                  <span className="text-sm text-zinc-500 mb-1.5">
                    {plan.period}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 mb-6">{plan.desc}</p>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-sm text-zinc-400"
                    >
                      <Check className="w-3.5 h-3.5 text-zinc-400 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.ctaHref}
                  className={`w-full flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    plan.highlight
                      ? "bg-white text-zinc-950 hover:bg-zinc-100 shadow-lg shadow-black/20"
                      : "border border-white/[0.10] bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06] hover:border-white/[0.15]"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
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
              Join HVAC contractors who are winning local search with AI. Free
              plan — no credit card required.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 active:scale-[0.98] transition-all duration-150 shadow-lg shadow-black/20"
            >
              Create your free account
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white/[0.05] border border-white/[0.08]">
              <Zap className="w-3 h-3 text-zinc-600" />
            </div>
            <span className="text-sm text-zinc-500 font-medium">HVAC SEO Bot</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-zinc-600">
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
            © {year} HVAC SEO Bot. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
