import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, FileText, Type, Hash, Search } from "lucide-react";

export const metadata: Metadata = {
  title:       "Free HVAC SEO Tools | HeatRank AI",
  description: "Free local SEO tools for HVAC contractors. Check title tags, generate meta descriptions, analyze keyword density — no signup required.",
  alternates:  { canonical: "/tools" },
  openGraph: {
    title:       "Free HVAC SEO Tools",
    description: "Free local SEO tools for HVAC contractors. No signup required.",
    url:         "/tools",
    type:        "website",
  },
};

const TOOLS = [
  {
    href: "/tools/title-tag-checker",
    icon: Type,
    title: "Title Tag Checker",
    desc: "Paste any URL or title and we'll grade its length, keyword usage, and click-worthiness.",
    cta: "Check a title",
  },
  {
    href: "/tools/meta-description-generator",
    icon: FileText,
    title: "Meta Description Generator",
    desc: "AI-generated meta descriptions for HVAC pages — optimized for length and CTR.",
    cta: "Generate one",
  },
  {
    href: "/tools/keyword-density",
    icon: Hash,
    title: "Keyword Density Analyzer",
    desc: "Paste your homepage copy and see which HVAC keywords you're actually using.",
    cta: "Analyze copy",
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-zinc-700/10 rounded-full blur-[140px]" />
      </div>

      <header className="relative border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/heatrank-logo.png" alt="HeatRank AI" width={32} height={32} className="rounded-xl w-8 h-8" priority />
            <span className="text-base font-semibold tracking-tight">
              <span className="text-zinc-100">HeatRank</span>
              <span className="text-zinc-400"> AI</span>
            </span>
          </Link>
          <Link href="/login" className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100 transition-all">
            Start free <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-6">
        <section className="pt-16 pb-12 text-center">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">
            Free tools
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-100 mb-5 leading-tight">
            Free HVAC SEO tools.{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">
              No signup.
            </span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Quick utilities to help HVAC contractors check and fix on-page SEO basics —
            without needing a HeatRank account.
          </p>
        </section>

        <section className="pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOOLS.map(({ href, icon: Icon, title, desc, cta }) => (
              <Link
                key={href}
                href={href}
                className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-white/[0.14] hover:bg-white/[0.04] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-amber-400" />
                </div>
                <h2 className="text-base font-semibold text-zinc-100 mb-1.5">{title}</h2>
                <p className="text-sm text-zinc-500 leading-relaxed mb-4">{desc}</p>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-300 group-hover:text-amber-300 transition-colors">
                  {cta} <ChevronRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="pb-20">
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] px-6 py-12 sm:px-12 text-center">
            <Search className="w-8 h-8 text-amber-400 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 tracking-tight mb-3">
              Want all this automated?
            </h2>
            <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto leading-relaxed">
              HeatRank AI runs all these checks plus rank tracking, review replies, and citation monitoring — automatically, every week.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 transition-all shadow-lg"
            >
              Start free 14-day trial <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-zinc-700">© {new Date().getFullYear()} HeatRank AI</span>
          <div className="flex items-center gap-6 text-xs text-zinc-600">
            <Link href="/" className="hover:text-zinc-400">Home</Link>
            <Link href="/pricing" className="hover:text-zinc-400">Pricing</Link>
            <Link href="/resources" className="hover:text-zinc-400">Resources</Link>
            <Link href="/about" className="hover:text-zinc-400">About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
