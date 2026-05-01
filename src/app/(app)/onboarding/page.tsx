import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Get Started — HVAC SEO Bot",
};

const STEPS = [
  { n: 1, label: "Complete your profile" },
  { n: 2, label: "Add your first business" },
  { n: 3, label: "Generate AI keywords" },
];

export default function OnboardingPage() {
  return (
    <div className="max-w-lg mx-auto px-6 py-16 text-center">
      <div className="mb-10">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2">
          Welcome
        </p>
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight mb-2">
          Let&apos;s set up your account
        </h1>
        <p className="text-sm text-zinc-500">
          Multi-step wizard coming in Phase 2.1. For now, jump straight to the
          dashboard.
        </p>
      </div>

      {/* Step indicators */}
      <div className="space-y-2 mb-10 text-left">
        {STEPS.map(({ n, label }) => (
          <div
            key={n}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02]"
          >
            <div className="w-6 h-6 rounded-full border border-white/[0.10] bg-white/[0.04] flex items-center justify-center text-xs font-semibold text-zinc-500 flex-shrink-0">
              {n}
            </div>
            <span className="text-sm text-zinc-400">{label}</span>
          </div>
        ))}
      </div>

      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100 active:scale-[0.98] transition-all duration-150 shadow-lg shadow-black/20"
      >
        Go to Dashboard
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
