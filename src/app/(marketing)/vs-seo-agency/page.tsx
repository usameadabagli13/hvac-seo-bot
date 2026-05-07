import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Check, X, ChevronRight, Clock, DollarSign, Zap, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "HeatRank AI vs Hiring an SEO Agency for HVAC | HeatRank AI",
  description:
    "Compare HeatRank AI to hiring a traditional SEO agency for your HVAC business. Get the same results in days, not months — at 1/10th the cost.",
  openGraph: {
    title: "HeatRank AI vs Hiring an SEO Agency",
    description: "Save thousands per month and rank in days, not quarters.",
    type: "website",
  },
};

const COMPARISON_ROWS = [
  { label: "Monthly cost",                     heatrank: "$39 – $199",        agency: "$1,500 – $5,000",  heatrankBetter: true  },
  { label: "Setup time",                       heatrank: "3 minutes",         agency: "2 – 4 weeks",       heatrankBetter: true  },
  { label: "Time to first keyword report",     heatrank: "30 seconds",        agency: "1 – 2 weeks",       heatrankBetter: true  },
  { label: "Local keyword research",           heatrank: true,                 agency: true,                heatrankBetter: null  },
  { label: "AI-generated review replies",      heatrank: true,                 agency: false,               heatrankBetter: true  },
  { label: "Real-time rank heatmap",           heatrank: true,                 agency: "Sometimes",         heatrankBetter: true  },
  { label: "On-page SEO audit",                heatrank: "Instant",           agency: "Quarterly",         heatrankBetter: true  },
  { label: "Competitor tracking",              heatrank: true,                 agency: true,                heatrankBetter: null  },
  { label: "Long-term contract required",      heatrank: false,                agency: true,                heatrankBetter: true  },
  { label: "Speak to an account manager",      heatrank: false,                agency: true,                heatrankBetter: false },
  { label: "Done-for-you content writing",     heatrank: false,                agency: true,                heatrankBetter: false },
  { label: "You own all your data",            heatrank: true,                 agency: "Sometimes",         heatrankBetter: true  },
];

const HIGHLIGHTS = [
  { icon: DollarSign, title: "1/10th the cost",  desc: "Most agencies charge $1,500–$5,000/month. HeatRank starts at $39." },
  { icon: Clock,      title: "Results in days",  desc: "No 30-day onboarding. Generate keywords and run audits in minutes." },
  { icon: Zap,        title: "AI does the work", desc: "Reply to reviews, generate keywords, and audit pages in seconds — not days." },
  { icon: Shield,     title: "No lock-in",       desc: "Cancel anytime. No annual contracts. No surprise upcharges." },
];

function Cell({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="w-4 h-4 text-emerald-400" />;
  if (value === false) return <X className="w-4 h-4 text-zinc-700" />;
  return <span className="text-sm text-zinc-300">{value}</span>;
}

export default function ComparisonPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-zinc-700/10 rounded-full blur-[140px]" />
      </div>

      {/* Nav */}
      <header className="relative border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/heatrank-logo.png" alt="HeatRank AI" width={32} height={32} className="rounded-xl w-8 h-8" priority />
            <span className="text-base font-semibold tracking-tight">
              <span className="text-zinc-100">HeatRank</span>
              <span className="text-zinc-400"> AI</span>
            </span>
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100 transition-all"
          >
            Start free <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-6">
        {/* Hero */}
        <section className="pt-16 pb-12 text-center">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">
            HeatRank AI vs SEO Agency
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-100 mb-5 leading-tight">
            Same results.{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">
              1/10th the cost.
            </span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-8">
            Hiring an SEO agency for your HVAC business means $1,500+/month and a
            30-day wait. HeatRank AI delivers the same outcomes in minutes — for
            a flat monthly price.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 transition-all shadow-lg"
          >
            Start your 14-day free trial <ChevronRight className="w-4 h-4" />
          </Link>
          <p className="mt-3 text-xs text-zinc-600">No credit card required</p>
        </section>

        {/* Highlights */}
        <section className="py-8 border-t border-white/[0.06]">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-100 mb-1">{title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison table */}
        <section className="py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight mb-3">
              Side-by-side comparison
            </h2>
            <p className="text-sm text-zinc-500">
              Honest. We&apos;re not perfect for every contractor — but if you&apos;re tired of agency invoices, this is for you.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1.5fr_1fr_1fr] sm:grid-cols-[2fr_1fr_1fr] border-b border-white/[0.06] bg-white/[0.02]">
              <div className="px-4 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider" />
              <div className="px-4 py-3 text-center">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  HeatRank AI
                </span>
              </div>
              <div className="px-4 py-3 text-center">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  SEO Agency
                </span>
              </div>
            </div>

            {/* Rows */}
            {COMPARISON_ROWS.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-[1.5fr_1fr_1fr] sm:grid-cols-[2fr_1fr_1fr] items-center ${
                  i !== COMPARISON_ROWS.length - 1 ? "border-b border-white/[0.04]" : ""
                }`}
              >
                <div className="px-4 py-3 text-sm text-zinc-300">{row.label}</div>
                <div className={`px-4 py-3 flex items-center justify-center ${row.heatrankBetter === true ? "bg-emerald-500/[0.04]" : ""}`}>
                  <Cell value={row.heatrank} />
                </div>
                <div className={`px-4 py-3 flex items-center justify-center ${row.heatrankBetter === false ? "bg-emerald-500/[0.04]" : ""}`}>
                  <Cell value={row.agency} />
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-zinc-700 mt-4 text-center max-w-2xl mx-auto leading-relaxed">
            Based on public agency pricing for HVAC SEO services in the US (2025).
            Highlighted cells show where each option is stronger.
          </p>
        </section>

        {/* When agencies are better */}
        <section className="py-10 border-t border-white/[0.06]">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2">
              When you should hire an agency
            </p>
            <h2 className="text-xl font-semibold text-zinc-100 mb-4">
              We&apos;re not a fit for every contractor
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              If you need someone to write blog posts every week, manage paid ads, redesign your website, and act as your full marketing department — an agency is the better choice.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              HeatRank AI is built for HVAC owners who want to handle local SEO themselves
              — but with AI doing the heavy lifting. If that&apos;s you, you&apos;ll save thousands a month.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 tracking-tight mb-3">
            Try it free for 14 days
          </h2>
          <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">
            No credit card required. Cancel anytime. See your first keywords in 30 seconds.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 transition-all shadow-lg"
          >
            Start free trial <ChevronRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-zinc-700">© {new Date().getFullYear()} HeatRank AI</span>
          <div className="flex items-center gap-6 text-xs text-zinc-600">
            <Link href="/" className="hover:text-zinc-400">Home</Link>
            <Link href="/pricing" className="hover:text-zinc-400">Pricing</Link>
            <Link href="/privacy" className="hover:text-zinc-400">Privacy</Link>
            <Link href="/terms" className="hover:text-zinc-400">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
