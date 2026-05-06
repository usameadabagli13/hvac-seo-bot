"use client";

import { useEffect, useState } from "react";
import { Sparkles, X, ChevronRight } from "lucide-react";

const DISMISS_KEY = "founding_banner_dismissed_v1";

export default function FoundingBanner() {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [claimed,   setClaimed]   = useState<number>(0);
  const [total,     setTotal]     = useState<number>(20);
  const [dismissed, setDismissed] = useState(true); // start hidden, reveal after fetch + storage check

  useEffect(() => {
    // Respect previous dismiss
    if (typeof window !== "undefined" && localStorage.getItem(DISMISS_KEY) === "1") {
      return;
    }

    let cancelled = false;
    fetch("/api/waitlist")
      .then((r) => r.json())
      .then((d: { total?: number; claimed?: number; remaining?: number }) => {
        if (cancelled) return;
        if (typeof d.total     === "number") setTotal(d.total);
        if (typeof d.claimed   === "number") setClaimed(d.claimed);
        if (typeof d.remaining === "number") setRemaining(d.remaining);
        // Reveal only when there are spots left
        if ((d.remaining ?? 0) > 0) setDismissed(false);
      })
      .catch(() => { /* silent */ });

    return () => { cancelled = true; };
  }, []);

  if (dismissed || remaining === null || remaining === 0) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch {}
  };

  return (
    <div className="relative z-30 bg-gradient-to-r from-amber-500/15 via-amber-500/[0.07] to-amber-500/15 border-b border-amber-500/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3">
        <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />

        {/* Desktop / tablet copy */}
        <p className="hidden sm:block flex-1 text-xs sm:text-sm text-zinc-200 truncate">
          <span className="font-semibold tabular-nums text-amber-300">{remaining}</span>
          <span className="text-zinc-300"> founding spots left</span>
          <span className="text-zinc-400"> · </span>
          <span className="text-zinc-500 tabular-nums">{claimed}/{total} already claimed</span>
          <span className="text-zinc-400"> · </span>
          <span className="text-zinc-300">30% off + lifetime ★ Founder badge</span>
        </p>

        {/* Mobile copy (compact) */}
        <p className="sm:hidden flex-1 text-xs text-zinc-200 truncate">
          <span className="font-semibold tabular-nums text-amber-300">{remaining} left</span>
          <span className="text-zinc-400"> · </span>
          <span className="text-zinc-500 tabular-nums">{claimed}/{total} taken</span>
        </p>

        <a
          href="#founding-offer"
          className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-400 text-zinc-950 text-xs font-semibold hover:bg-amber-300 active:scale-[0.97] transition-all"
        >
          Claim
          <ChevronRight className="w-3 h-3" />
        </a>

        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="flex-shrink-0 p-1 rounded text-zinc-600 hover:text-zinc-300 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
