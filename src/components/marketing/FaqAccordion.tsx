"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "Do I need any SEO or technical knowledge?",
    a: "Not at all. HeatRank AI is built for contractors, not marketers. Everything is explained in plain English, and the AI does the heavy lifting — you just review and approve.",
  },
  {
    q: "Will it work for my city?",
    a: "Yes. The AI generates location-specific keywords for any US city. Whether you're in Dallas or Boise, your keywords will be tailored to your exact service area and local competition.",
  },
  {
    q: "How secure is my business data?",
    a: "Very. Your data is stored with row-level security on PostgreSQL (Supabase). Every user can only access their own account — your competitors can never see your keywords, reviews, or rankings.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. All plans are month-to-month with no long-term contracts. You can cancel with one click from your account settings — no phone calls, no cancellation fees, no hassle.",
  },
  {
    q: "What's included in the free plan?",
    a: "The free plan includes 1 business, 2 AI keyword generations per month, 5 AI review replies per month, and 1 SEO audit per month. No credit card required to get started.",
  },
];

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {FAQ_ITEMS.map(({ q, a }, i) => (
        <div
          key={i}
          className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left gap-4 hover:bg-white/[0.02] transition-colors duration-150"
            aria-expanded={open === i}
          >
            <span className="text-sm font-medium text-zinc-200">{q}</span>
            <ChevronDown
              className={`w-4 h-4 text-zinc-500 flex-shrink-0 transition-transform duration-200 ${
                open === i ? "rotate-180" : ""
              }`}
            />
          </button>
          {open === i && (
            <div className="px-5 pb-5">
              <p className="text-sm text-zinc-500 leading-relaxed">{a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
