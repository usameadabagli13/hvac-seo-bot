import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Target, Users, Wrench } from "lucide-react";

export const metadata: Metadata = {
  title:       "About HeatRank AI | Built for HVAC Contractors",
  description: "Why we built HeatRank AI: simple, AI-powered local SEO tools for HVAC contractors who want results without paying agency rates.",
  alternates:  { canonical: "/about" },
  openGraph: {
    title:       "About HeatRank AI",
    description: "Why we built HeatRank AI for HVAC contractors.",
    url:         "/about",
    type:        "website",
  },
};

const VALUES = [
  {
    icon: Target,
    title: "HVAC-only focus",
    desc: "Generic SEO tools spread thin across every industry. We picked one — HVAC — and built every feature around how homeowners actually search for AC repair, furnace install, and emergency service.",
  },
  {
    icon: Wrench,
    title: "Built for owners, not agencies",
    desc: "Most contractors shouldn't need a marketing degree to rank on Google. HeatRank does the heavy lifting so you can spend your time on installs and customer calls — not keyword spreadsheets.",
  },
  {
    icon: Users,
    title: "No long-term contracts",
    desc: "We earn your renewal every month. If HeatRank stops delivering value, you cancel in two clicks — no calls to a sales rep, no penalty fees, no held data.",
  },
];

export default function AboutPage() {
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

      <main className="relative max-w-3xl mx-auto px-6">
        {/* Hero */}
        <section className="pt-16 pb-12 text-center">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">
            About HeatRank AI
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-100 mb-6 leading-tight">
            HVAC contractors deserve{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">
              better local SEO tools
            </span>
          </h1>
        </section>

        {/* Story */}
        <section className="pb-12 space-y-5 text-zinc-400 leading-relaxed">
          <p className="text-base">
            We started HeatRank AI after watching too many talented HVAC contractors
            get stuck choosing between two bad options.
          </p>
          <p className="text-base">
            <strong className="text-zinc-200">Option 1:</strong> Hire an SEO agency
            for $1,500–$5,000/month, sign a 6-month contract, wait 30 days for
            onboarding, and pray the keyword report you eventually receive is worth it.
          </p>
          <p className="text-base">
            <strong className="text-zinc-200">Option 2:</strong> Try to learn local SEO
            yourself — between service calls, ductwork installs, and family time.
            Spend 20 hours a week reading blog posts that are 80% generic advice and
            20% sales pitches.
          </p>
          <p className="text-base">
            Neither is acceptable. So we built a third option.
          </p>
          <p className="text-base">
            HeatRank AI is what happens when AI does the SEO work — keyword research,
            review replies, rank tracking, on-page audits — and an HVAC owner just
            spends 15 minutes a week reviewing the output. No agency. No contracts.
            No 6-month wait.
          </p>
        </section>

        {/* Values */}
        <section className="py-12 border-t border-white/[0.06]">
          <h2 className="text-2xl font-semibold text-zinc-100 mb-8 tracking-tight text-center">
            What we stand for
          </h2>
          <div className="space-y-4">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-zinc-100 mb-1">{title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 tracking-tight mb-3">
            Try it for two weeks. Free.
          </h2>
          <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto leading-relaxed">
            No credit card. No contracts. See your first AI-generated keyword list in 30 seconds.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 transition-all shadow-lg"
          >
            Start free trial <ChevronRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      <footer className="relative border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-zinc-700">© {new Date().getFullYear()} HeatRank AI</span>
          <div className="flex items-center gap-6 text-xs text-zinc-600">
            <Link href="/" className="hover:text-zinc-400">Home</Link>
            <Link href="/pricing" className="hover:text-zinc-400">Pricing</Link>
            <Link href="/resources" className="hover:text-zinc-400">Resources</Link>
            <Link href="/privacy" className="hover:text-zinc-400">Privacy</Link>
            <Link href="/terms" className="hover:text-zinc-400">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
