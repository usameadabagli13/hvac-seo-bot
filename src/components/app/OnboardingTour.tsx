"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, ChevronRight, X, Rocket } from "lucide-react";
import type { OnboardingState } from "@/lib/onboarding";

interface Props {
  state: OnboardingState;
}

interface Step {
  key:    keyof OnboardingState;
  label:  string;
  cta:    string;
  href:   string;
}

const STEPS: Step[] = [
  { key: "hasBusiness", label: "Add your business",                cta: "Add business", href: "/dashboard#business-form" },
  { key: "hasGBP",      label: "Connect Google Business Profile",  cta: "Connect",      href: "/reviews" },
  { key: "hasSnapshot", label: "Run your first rank snapshot",     cta: "Run snapshot", href: "/rank" },
];

export default function OnboardingTour({ state }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  if (state.allDone) return null;

  const completed = STEPS.filter((s) => state[s.key]).length;
  const nextStep  = STEPS.find((s) => !state[s.key]);

  if (!nextStep) return null;

  // ── Collapsed pill ─────────────────────────────────────────────────────────
  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-20 right-4 lg:bottom-4 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-900/95 border border-white/[0.10] backdrop-blur-md shadow-2xl shadow-black/40 hover:border-white/[0.18] transition-colors"
      >
        <Rocket className="w-4 h-4 text-emerald-400" />
        <span className="text-xs font-semibold text-zinc-200">
          Setup · {completed}/{STEPS.length}
        </span>
      </button>
    );
  }

  // ── Expanded card ──────────────────────────────────────────────────────────
  return (
    <div className="fixed bottom-20 right-4 lg:bottom-4 z-40 w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl bg-zinc-900/95 border border-white/[0.10] backdrop-blur-md shadow-2xl shadow-black/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Rocket className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
            Getting started
          </span>
          <span className="text-xs text-zinc-600 tabular-nums">
            {completed}/{STEPS.length}
          </span>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          aria-label="Collapse tour"
          className="text-zinc-600 hover:text-zinc-300 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Steps */}
      <div className="px-4 py-3 space-y-2.5">
        {STEPS.map((step, i) => {
          const done   = state[step.key];
          const isNext = !done && step.key === nextStep.key;
          return (
            <div key={i} className="flex items-center gap-2.5">
              {done
                ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                : <Circle       className={`w-4 h-4 flex-shrink-0 ${isNext ? "text-zinc-300" : "text-zinc-700"}`} />
              }
              <span className={`flex-1 text-xs ${done ? "text-zinc-600 line-through" : isNext ? "text-zinc-100 font-medium" : "text-zinc-500"}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Next-step CTA */}
      <div className="px-4 py-3 border-t border-white/[0.06] bg-white/[0.02]">
        <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1.5">
          Next up
        </p>
        <Link
          href={nextStep.href}
          className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-100 active:scale-[0.97] transition-all"
        >
          <span>{nextStep.cta}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
