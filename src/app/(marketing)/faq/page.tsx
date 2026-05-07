import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import FaqAccordion from "@/components/marketing/FaqAccordion";

export const metadata: Metadata = {
  title:       "FAQ | HeatRank AI",
  description: "Frequently asked questions about HeatRank AI — pricing, trials, how the AI works, GBP integration, and more.",
  alternates:  { canonical: "/faq" },
  openGraph: {
    title:       "HeatRank AI FAQ",
    description: "Common questions about HeatRank AI for HVAC contractors.",
    url:         "/faq",
    type:        "website",
  },
};

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
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

      <main className="max-w-3xl mx-auto px-6 pt-12 pb-20">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">FAQ</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100 mb-3">
          Frequently asked questions
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed mb-10 max-w-2xl">
          The most common questions HVAC contractors ask before signing up. Don&apos;t see yours? <Link href="/contact" className="text-amber-400 hover:underline">Email us</Link>.
        </p>

        <FaqAccordion />

        <section className="mt-16">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center">
            <p className="text-sm text-zinc-300 mb-4">
              Still have questions? <Link href="/contact" className="text-amber-400 hover:underline">Get in touch</Link> or just start your free trial.
            </p>
            <Link href="/login" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 transition-all">
              Start free 14-day trial <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
