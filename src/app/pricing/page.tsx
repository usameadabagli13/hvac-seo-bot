import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import PricingToggle from "@/components/marketing/PricingToggle";
import FaqAccordion from "@/components/marketing/FaqAccordion";
import { PLANS } from "@/lib/plans";

export const metadata: Metadata = {
  title:       "Pricing — HeatRank AI",
  description: "Simple plans built for HVAC contractors. Free 14-day trial. Cancel anytime.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-white/[0.06] sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/heatrank-logo.png" alt="HeatRank AI" width={32} height={32} className="rounded-xl w-8 h-8" priority />
            <span className="text-base font-semibold text-zinc-100 tracking-tight">
              HeatRank<span className="text-zinc-500"> AI</span>
            </span>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100 transition-all"
          >
            Start free
          </Link>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition-colors mb-8"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to home
        </Link>

        <div className="text-center mb-12">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">Pricing</p>
          <h1 className="text-3xl sm:text-4xl font-semibold text-zinc-100 tracking-tight mb-3">
            Built for working contractors
          </h1>
          <p className="text-sm text-zinc-500 max-w-xl mx-auto leading-relaxed">
            Start with a 14-day Pro trial. No credit card required. Cancel anytime —
            your data and audit history stay yours.
          </p>
        </div>

        <PricingToggle plans={PLANS} />

        {/* Trust strip */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-zinc-600">
          <span>✓ 14-day free trial</span>
          <span>✓ No credit card</span>
          <span>✓ Cancel anytime</span>
          <span>✓ Annual saves ~20%</span>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-zinc-100 tracking-tight mb-6 text-center">
            Frequently asked questions
          </h2>
          <FaqAccordion />
        </div>
      </main>

      <footer className="border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-zinc-700">© {new Date().getFullYear()} HeatRank AI</span>
          <div className="flex items-center gap-6 text-xs text-zinc-600">
            <Link href="/privacy" className="hover:text-zinc-400">Privacy</Link>
            <Link href="/terms"   className="hover:text-zinc-400">Terms</Link>
            <Link href="/login"   className="hover:text-zinc-400">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
