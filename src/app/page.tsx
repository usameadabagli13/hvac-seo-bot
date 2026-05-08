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
import FoundingBanner from "@/components/marketing/FoundingBanner";
import MobileNav from "@/components/marketing/MobileNav";
import StickyMobileCTA from "@/components/marketing/StickyMobileCTA";
import Newsletter from "@/components/marketing/Newsletter";
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
    metric: "More calls",
    metricLabel: "every week",
    quote:
      "Used to take a whole afternoon to research keywords. Now I generate 12 great ones in seconds. The ROI is insane.",
  },
  {
    initials: "SK",
    name: "Sarah K.",
    company: "Arctic Cool Services, Phoenix AZ",
    metric: "Faster replies",
    metricLabel: "to every review",
    quote:
      "The review reply AI is my favorite feature. My response time dropped from days to minutes — customers notice.",
  },
  {
    initials: "JR",
    name: "James R.",
    company: "ProClimate HVAC, Houston TX",
    metric: "Better ranks",
    metricLabel: "in core keywords",
    quote:
      "First month using the rank tracker, I could see exactly which keywords needed work. Rankings improved in 6 weeks.",
  },
];

const TRUST_SIGNALS = [
  { icon: Shield, label: "30-day money-back guarantee" },
  { icon: Clock,  label: "Set up in under 3 minutes" },
  { icon: Zap,    label: "First keywords in 30 seconds" },
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

      <StickyMobileCTA />

      {/* ── Founding member promo bar (top of page; non-sticky) ─────────────── */}
      <FoundingBanner />

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
            <MobileNav />
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
              href="/vs-seo-agency"
              className="hidden md:block text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Compare
            </Link>
            <Link
              href="/tools"
              className="hidden md:flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 transition-colors"
            >
              Free tools
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 uppercase tracking-wider">New</span>
            </Link>
            <Link
              href="/login"
              className="hidden sm:block text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100 active:scale-[0.98] transition-all duration-150 shadow-sm"
            >
              Start Free Trial
            </Link>
          </nav>
        </div>
      </header>

      <main id="main" className="relative">
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-5 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-24 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/[0.06] text-xs text-emerald-200 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium">14-day free trial</span>
            <span className="text-emerald-500/50">·</span>
            <span>No credit card</span>
            <span className="text-emerald-500/50">·</span>
            <span className="font-semibold text-emerald-300">30-day money-back guarantee</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-zinc-100 tracking-tight leading-[1.1] mb-6 max-w-3xl mx-auto">
            Show up first when locals Google{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
              &ldquo;HVAC near me&rdquo;
            </span>
          </h1>

          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            AI-powered local SEO built for HVAC contractors who want the phone to ring.
            No agency, no contracts, no <span className="text-zinc-300 font-medium">$2,000/mo</span> bills.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 active:scale-[0.98] transition-all duration-150 shadow-lg shadow-black/20"
            >
              <span className="sm:hidden">Start Free Trial</span>
              <span className="hidden sm:inline">Start Free Trial — No Card Required</span>
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

          {/* Trust bar — security + legal badges */}
          <div className="mt-12 pt-8 border-t border-white/[0.04] max-w-3xl mx-auto">
            <p className="text-[10px] font-medium text-zinc-700 uppercase tracking-widest mb-4">
              Built on enterprise-grade infrastructure
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              {[
                { label: "SOC 2 Type II",       sub: "via Supabase"  },
                { label: "GDPR compliant",      sub: "EU users"      },
                { label: "256-bit encryption",  sub: "TLS in transit"},
                { label: "99.9% uptime SLA",    sub: "Vercel edge"   },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.01]">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <div className="flex flex-col leading-tight">
                    <span className="text-[11px] font-medium text-zinc-300">{b.label}</span>
                    <span className="text-[9px] text-zinc-600">{b.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Dashboard Screenshot ────────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-5 sm:px-6 pb-12 sm:pb-16">
          <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden shadow-2xl shadow-black/40">
            <div className="absolute inset-x-0 top-0 h-8 bg-zinc-900/80 flex items-center px-4 gap-1.5 border-b border-white/[0.05]">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              <span className="ml-3 text-[10px] text-zinc-600 font-mono">heatrankai.com/dashboard</span>
            </div>
            <Image
              src="/dashboard-preview.png"
              alt="HeatRank AI dashboard — HVAC SEO software showing keyword research, review management, and rank tracking"
              width={1440}
              height={900}
              className="w-full h-auto pt-8"
              priority={false}
            />
          </div>
          <p className="text-center text-xs text-zinc-600 mt-3">
            Everything in one place — keywords, reviews, rank tracker, and SEO audit
          </p>
        </section>

        {/* ── HVAC Industry Stats ──────────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-5 sm:px-6 pb-14 sm:pb-20">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-10 sm:px-12">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2 text-center">
              The HVAC SEO opportunity
            </p>
            <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100 text-center mb-8 tracking-tight">
              Why local SEO matters for HVAC contractors
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { value: "97%",  label: "of homeowners search online before hiring an HVAC contractor" },
                { value: "46%",  label: "of all Google searches are looking for local information" },
                { value: "76%",  label: "of local searches result in a phone call within 24 hours" },
                { value: "$10B", label: "annual US HVAC services market — yours to capture" },
              ].map(({ value, label }) => (
                <div key={value} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent mb-2">
                    {value}
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">{label}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-zinc-700 mt-8 text-center">
              Sources: Google Local Search Study, BrightLocal Consumer Review Survey, IBISWorld HVAC Industry Report
            </p>
          </div>
        </section>

        {/* ── Live Demo Widget ────────────────────────────────────────────────── */}
        <section id="demo" className="max-w-2xl mx-auto px-5 sm:px-6 pb-16 sm:pb-24 scroll-mt-20">
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
          {/* Social proof strip */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="flex -space-x-2">
              {["bg-amber-500","bg-blue-500","bg-emerald-500","bg-purple-500","bg-rose-500"].map((c,i) => (
                <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-zinc-950 flex items-center justify-center text-[9px] font-bold text-white`}>
                  {["MT","SK","JR","AB","CL"][i]}
                </div>
              ))}
            </div>
            <p className="text-xs text-zinc-500">
              Tried by contractors in <span className="text-zinc-300 font-medium">25+ US cities</span>
            </p>
          </div>
          <DemoWidget />
        </section>

        {/* ── How It Works ─────────────────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-5 sm:px-6 pb-16 sm:pb-24">
          <div className="text-center mb-12">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2">
              How it works
            </p>
            <h2 className="text-3xl font-bold text-zinc-100 tracking-tight">
              Three steps. No agency. No phone calls.
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 relative">
            {/* Connector line behind cards (desktop only) */}
            <div className="hidden sm:block absolute top-7 left-[16%] right-[16%] h-px bg-gradient-to-r from-white/[0.05] via-white/[0.10] to-white/[0.05] pointer-events-none" />
            {[
              { step: "1", title: "Add your business",       desc: "Type your business name and city. We seed your dashboard with HVAC keywords specific to your market." },
              { step: "2", title: "Run the AI tools",        desc: "Generate keywords, audit your homepage, get rank heatmaps, and reply to reviews — all from one dashboard." },
              { step: "3", title: "Watch your rank climb",   desc: "Apply the recommendations and rerun snapshots weekly. Most contractors see top-10 movement within 6–8 weeks." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-white/[0.10] transition-all">
                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/[0.10] flex items-center justify-center mb-4 text-sm font-bold text-zinc-200 relative z-10">
                  {step}
                </div>
                <h3 className="text-base font-semibold text-zinc-100 mb-1.5">{title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ────────────────────────────────────────────────────────── */}
        <section id="features" className="max-w-6xl mx-auto px-5 sm:px-6 pb-16 sm:pb-24 scroll-mt-20">
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

        {/* ── Free Tools strip ─────────────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-5 sm:px-6 pb-16 sm:pb-24">
          <div className="rounded-3xl border border-amber-500/15 bg-gradient-to-br from-amber-500/[0.06] via-amber-500/[0.02] to-transparent px-6 py-10 sm:px-10 sm:py-12">
            <div className="text-center mb-8">
              <p className="text-xs font-medium text-amber-400 uppercase tracking-widest mb-2">
                Free tools — no signup
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight mb-2">
                Try it before you sign up
              </h2>
              <p className="text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
                Three quick utilities for HVAC contractors — works in your browser, no account needed.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { href: "/tools/title-tag-checker",          label: "Title Tag Checker",       desc: "Grade your SEO title in 3 seconds" },
                { href: "/tools/meta-description-generator", label: "Meta Description Generator", desc: "Get 3 variants per page" },
                { href: "/tools/keyword-density",            label: "Keyword Density Analyzer", desc: "Spot missing HVAC keywords" },
              ].map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className="group rounded-2xl border border-white/[0.08] bg-zinc-950/40 p-5 hover:border-amber-400/40 hover:bg-zinc-900/60 transition-all"
                >
                  <p className="text-sm font-semibold text-zinc-100 mb-1 group-hover:text-amber-300 transition-colors">{t.label}</p>
                  <p className="text-xs text-zinc-500 leading-relaxed">{t.desc}</p>
                  <span className="inline-flex items-center gap-1 mt-3 text-[11px] font-medium text-amber-400 group-hover:text-amber-300 transition-colors">
                    Try it <ChevronRight className="w-3 h-3" />
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link href="/tools" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                See all free tools →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Pricing ─────────────────────────────────────────────────────────── */}
        <section id="pricing" className="max-w-6xl mx-auto px-5 sm:px-6 pb-16 sm:pb-24 scroll-mt-20">
          <div className="text-center mb-10">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2">
              Simple pricing
            </p>
            <h2 className="text-3xl font-bold text-zinc-100 tracking-tight mb-3">
              14 days free. Then pick your plan.
            </h2>
            <p className="text-sm text-zinc-500 max-w-md mx-auto mb-6">
              No credit card required to start. Upgrade, downgrade, or cancel anytime.
            </p>

            {/* Money-back guarantee — front and center */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/[0.08]">
              <span className="text-base">🛡️</span>
              <span className="text-sm font-semibold text-emerald-300">30-day money-back guarantee</span>
              <span className="hidden sm:inline text-xs text-emerald-200/70">— full refund if HeatRank doesn&apos;t move the needle</span>
            </div>
          </div>

          <PricingToggle plans={PLANS} />
        </section>

        {/* ── Founding Member offer (right after pricing for max impact) ───── */}
        <section id="founding-offer" className="max-w-3xl mx-auto px-5 sm:px-6 pb-16 sm:pb-24 scroll-mt-20">
          <div className="rounded-3xl border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.10] via-amber-500/[0.04] to-transparent px-6 py-8 sm:px-10 sm:py-10 shadow-2xl shadow-amber-500/[0.04]">
            <div className="mb-5">
              <p className="text-xs font-medium text-amber-400 uppercase tracking-widest mb-2">
                ★ Limited launch offer
              </p>
              <h3 className="text-2xl font-semibold text-zinc-100 tracking-tight mb-2">
                Become a founding member — 30% off your first year
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Founding members lock in <strong className="text-amber-300">30% off the Pro plan for 12 months</strong>,
                plus a permanent <strong className="text-amber-300">★ Founder badge</strong> on their account —
                priority support and early access to every new feature, forever. Once the counter hits zero,
                founder status closes for good.
              </p>
            </div>

            {/* Risk-free trio */}
            <div className="grid sm:grid-cols-3 gap-2.5 mb-5">
              {[
                { icon: Clock,  label: "14-day free trial",          sub: "No credit card" },
                { icon: Zap,    label: "30% off for 12 months",      sub: "Founder pricing" },
                { icon: Shield, label: "30-day money-back guarantee", sub: "Full refund, no questions" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="rounded-xl border border-amber-500/15 bg-amber-500/[0.04] px-3 py-2.5 flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-amber-300 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-amber-200 leading-tight truncate">{label}</p>
                    <p className="text-[10px] text-amber-200/60 leading-tight truncate">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <WaitlistForm />
          </div>
        </section>

        {/* ── Testimonials ────────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-5 sm:px-6 pb-16 sm:pb-24">
          <div className="text-center mb-12">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2">
              Trusted by contractors
            </p>
            <h2 className="text-3xl font-bold text-zinc-100 tracking-tight">
              Real results from real HVAC owners
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TESTIMONIALS.map(({ initials, name, company, quote, metric, metricLabel }) => (
              <div
                key={name}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 flex flex-col gap-4"
              >
                {/* Metric badge */}
                <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-xs font-bold text-emerald-300">{metric}</span>
                  <span className="text-[10px] text-emerald-400/70">· {metricLabel}</span>
                </div>
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
        <section className="max-w-2xl mx-auto px-5 sm:px-6 pb-16 sm:pb-24">
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
        <section className="max-w-6xl mx-auto px-5 sm:px-6 pb-16 sm:pb-24">
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] px-6 sm:px-8 py-12 sm:py-16 text-center relative overflow-hidden">
            {/* Money-back ribbon */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/25 bg-emerald-500/[0.08] text-[11px] font-semibold text-emerald-300 uppercase tracking-widest mb-5">
              <Shield className="w-3 h-3" />
              30-day money-back guarantee
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100 tracking-tight mb-3">
              Risk-free way to rank higher
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base mb-2 max-w-lg mx-auto leading-relaxed">
              Try every Pro feature free for 14 days — no credit card required.
            </p>
            <p className="text-zinc-500 text-sm mb-8 max-w-lg mx-auto leading-relaxed">
              Upgrade and HeatRank doesn&apos;t move the needle in 30 days?
              <br className="hidden sm:block" />
              Email us. Full refund. No phone tag, no questions asked.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 active:scale-[0.98] transition-all duration-150 shadow-lg shadow-black/20"
            >
              Start your 14-day free trial
              <ChevronRight className="w-4 h-4" />
            </Link>
            <p className="mt-3 text-[11px] text-zinc-600">
              14 days free · No credit card · 30-day money-back if you upgrade
            </p>
          </div>
        </section>

      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
            {/* Brand */}
            <div className="col-span-2 md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <Image src="/heatrank-logo.png" alt="HeatRank AI" width={24} height={24} className="rounded-xl w-6 h-6" />
                <span className="text-base font-semibold text-zinc-100 tracking-tight">
                  HeatRank<span className="text-zinc-500"> AI</span>
                </span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">
                Local SEO tools built exclusively for HVAC contractors. Rank higher on Google without an agency.
              </p>
            </div>

            {/* Product */}
            <div>
              <p className="text-[11px] font-semibold text-zinc-300 uppercase tracking-widest mb-3">Product</p>
              <ul className="space-y-2 text-xs text-zinc-500">
                <li><Link href="/#features" className="hover:text-zinc-300 transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-zinc-300 transition-colors">Pricing</Link></li>
                <li><Link href="/vs-seo-agency" className="hover:text-zinc-300 transition-colors">vs SEO Agency</Link></li>
                <li><Link href="/case-studies" className="hover:text-zinc-300 transition-colors">Case studies</Link></li>
                <li><Link href="/login" className="hover:text-zinc-300 transition-colors">Sign in</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <p className="text-[11px] font-semibold text-zinc-300 uppercase tracking-widest mb-3">Resources</p>
              <ul className="space-y-2 text-xs text-zinc-500">
                <li><Link href="/resources" className="hover:text-zinc-300 transition-colors">SEO tips</Link></li>
                <li><Link href="/tools" className="hover:text-zinc-300 transition-colors">Free tools</Link></li>
                <li><Link href="/glossary" className="hover:text-zinc-300 transition-colors">SEO glossary</Link></li>
                <li><Link href="/faq" className="hover:text-zinc-300 transition-colors">FAQ</Link></li>
                <li><Link href="/integrations" className="hover:text-zinc-300 transition-colors">Integrations</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-[11px] font-semibold text-zinc-300 uppercase tracking-widest mb-3">Company</p>
              <ul className="space-y-2 text-xs text-zinc-500">
                <li><Link href="/about" className="hover:text-zinc-300 transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-zinc-300 transition-colors">Contact</Link></li>
                <li><Link href="/roadmap" className="hover:text-zinc-300 transition-colors">Roadmap</Link></li>
                <li><Link href="/changelog" className="hover:text-zinc-300 transition-colors">Changelog</Link></li>
                <li><Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className="pt-8 mt-2 border-t border-white/[0.04]">
            <div className="grid sm:grid-cols-[1fr_1.2fr] gap-6 items-center">
              <div>
                <p className="text-sm font-semibold text-zinc-200 mb-1">One HVAC SEO tip per week</p>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Free, actionable, no fluff. Unsubscribe in one click whenever.
                </p>
              </div>
              <Newsletter />
            </div>
          </div>

          <div className="pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-zinc-700">© {year} HeatRank AI. All rights reserved.</p>
            <p className="text-[11px] text-zinc-700">Built for HVAC contractors in the US</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
