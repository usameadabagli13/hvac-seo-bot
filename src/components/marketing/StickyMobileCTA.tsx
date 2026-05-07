"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, X } from "lucide-react";

export default function StickyMobileCTA() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = () => {
      const scrolled = window.scrollY > 600;
      setShow(scrolled);
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  if (!show || dismissed) return null;

  return (
    <div className="sm:hidden fixed bottom-3 inset-x-3 z-40 rounded-2xl border border-white/[0.14] bg-zinc-950 shadow-2xl shadow-black/60 flex items-center gap-2 p-2 pl-4">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-zinc-100 leading-tight truncate">14-day free trial</p>
        <p className="text-[10px] text-zinc-500">No credit card required</p>
      </div>
      <Link
        href="/login"
        className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-100 active:scale-[0.97] transition-all whitespace-nowrap"
      >
        Start free <ChevronRight className="w-3 h-3" />
      </Link>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="flex items-center justify-center w-7 h-7 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.04]"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
