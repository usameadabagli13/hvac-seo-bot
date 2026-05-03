"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Minus } from "lucide-react";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  desc: string;
  cta: string;
  ctaHref: string;
  highlight: boolean;
  features: PlanFeature[];
}

export default function PricingToggle({ plans }: { plans: Plan[] }) {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <>
      {/* ── Toggle ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <span
          className={`text-sm font-medium transition-colors duration-200 ${
            !isAnnual ? "text-zinc-200" : "text-zinc-600"
          }`}
        >
          Monthly
        </span>

        <button
          id="pricing-toggle"
          type="button"
          role="switch"
          aria-checked={isAnnual}
          onClick={() => setIsAnnual((v) => !v)}
          className="relative w-12 h-6 rounded-full bg-zinc-800 border border-white/[0.10] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/10"
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
              isAnnual ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>

        <span
          className={`text-sm font-medium transition-colors duration-200 ${
            isAnnual ? "text-zinc-200" : "text-zinc-600"
          }`}
        >
          Yearly
        </span>

        {isAnnual && (
          <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
            Save 20%
          </span>
        )}
      </div>

      {/* ── Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {plans.map((plan) => {
          const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
          const monthlyEquiv = plan.monthlyPrice;
          const yearlySavings = (monthlyEquiv - plan.annualPrice) * 12;

          return (
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

              {/* ── Price display ─────────────────────── */}
              <div className="flex items-end gap-1.5 mb-1">
                {isAnnual && price !== monthlyEquiv && (
                  <span className="text-lg text-zinc-600 line-through font-semibold mb-1">
                    ${monthlyEquiv}
                  </span>
                )}
                <span className="text-4xl font-bold text-zinc-100">
                  ${price}
                </span>
                <span className="text-sm text-zinc-500 mb-1.5">/mo</span>
              </div>

              {isAnnual && yearlySavings > 0 && (
                <p className="text-[11px] text-emerald-400 font-medium mb-4">
                  Billed annually · Save ${yearlySavings}/year
                </p>
              )}
              {(!isAnnual || yearlySavings === 0) && (
                <p className="text-xs text-zinc-600 mb-4">{plan.desc}</p>
              )}

              {/* ── Features ─────────────────────────── */}
              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li
                    key={f.text}
                    className={`flex items-start gap-2.5 text-sm ${
                      f.included ? "text-zinc-400" : "text-zinc-700"
                    }`}
                  >
                    {f.included ? (
                      <Check className="w-3.5 h-3.5 text-zinc-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Minus className="w-3.5 h-3.5 text-zinc-700 mt-0.5 flex-shrink-0" />
                    )}
                    {f.text}
                  </li>
                ))}
              </ul>

              {/* ── CTA ──────────────────────────────── */}
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
          );
        })}
      </div>
    </>
  );
}
