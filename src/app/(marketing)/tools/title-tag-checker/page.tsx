import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TitleTagChecker from "./TitleTagChecker";

export const metadata: Metadata = {
  title:       "Free Title Tag Checker for HVAC Sites | HeatRank AI",
  description: "Check your page title tag length, keyword usage, and SEO score. Free tool for HVAC contractors. No signup required.",
  alternates:  { canonical: "/tools/title-tag-checker" },
};

export default function TitleTagCheckerPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/tools" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to tools
          </Link>
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/heatrank-logo.png" alt="HeatRank AI" width={28} height={28} className="rounded-xl w-7 h-7" />
            <span className="text-sm font-semibold text-zinc-100 tracking-tight">HeatRank<span className="text-zinc-400"> AI</span></span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pt-12 pb-20">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">Free tool</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100 mb-3">
          Title Tag Checker
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed mb-10 max-w-2xl">
          Paste any title tag below. We&apos;ll check the length, count words, flag truncation, and grade it for HVAC local-SEO best practices.
        </p>

        <TitleTagChecker />

        <section className="mt-14 pt-10 border-t border-white/[0.06]">
          <h2 className="text-lg font-semibold text-zinc-100 mb-3">What makes a good HVAC title tag?</h2>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li>• Length between 50–60 characters (Google truncates ~600px wide)</li>
            <li>• Primary keyword near the start: &ldquo;AC Repair Dallas&rdquo; not &ldquo;Quality services in&rdquo;</li>
            <li>• Include city name for local intent</li>
            <li>• End with brand name: &ldquo;... | YourBrand&rdquo;</li>
            <li>• Avoid keyword stuffing — Google penalizes it</li>
          </ul>
        </section>

        <section className="mt-10">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center">
            <p className="text-sm text-zinc-300 mb-4">
              HeatRank AI audits your <strong>whole homepage</strong>, not just the title.
            </p>
            <Link href="/login" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 transition-all">
              Try the full audit free <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
