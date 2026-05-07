"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronRight } from "lucide-react";

interface NavLink { href: string; label: string; }

const LINKS: NavLink[] = [
  { href: "/#features",     label: "Features" },
  { href: "/pricing",       label: "Pricing" },
  { href: "/vs-seo-agency", label: "vs SEO Agency" },
  { href: "/vs-podium",     label: "vs Podium" },
  { href: "/vs-birdeye",    label: "vs Birdeye" },
  { href: "/case-studies",  label: "Case studies" },
  { href: "/resources",     label: "Resources" },
  { href: "/tools",         label: "Free tools" },
  { href: "/glossary",      label: "Glossary" },
  { href: "/integrations",  label: "Integrations" },
  { href: "/roadmap",       label: "Roadmap" },
  { href: "/changelog",     label: "Changelog" },
  { href: "/about",         label: "About" },
  { href: "/faq",           label: "FAQ" },
  { href: "/contact",       label: "Contact" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="sm:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-white/[0.10] bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06] transition-all"
        aria-label="Open menu"
      >
        <Menu className="w-4 h-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] sm:hidden bg-zinc-950 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 h-14 border-b border-white/[0.06] flex-shrink-0">
            <span className="text-sm font-semibold text-zinc-200">Menu</span>
            <button
              onClick={() => setOpen(false)}
              className="flex items-center justify-center w-9 h-9 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.05]"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Top CTAs — visible immediately, no scroll needed */}
          <div className="px-5 pt-4 pb-3 space-y-2 flex-shrink-0 border-b border-white/[0.04]">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-white text-zinc-950 text-base font-bold hover:bg-zinc-100 active:scale-[0.98] transition-all"
            >
              Start free trial
            </Link>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 w-full h-11 rounded-xl border border-white/[0.10] bg-white/[0.03] text-zinc-300 text-sm hover:bg-white/[0.06] transition-all"
            >
              Sign in
            </Link>
          </div>

          {/* Links list */}
          <nav className="flex-1 overflow-y-auto py-2">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-5 py-3.5 text-base text-zinc-200 hover:text-white hover:bg-white/[0.04] active:bg-white/[0.06] transition-colors"
              >
                <span>{l.label}</span>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-white/[0.06] flex-shrink-0">
            <p className="text-[11px] text-zinc-600 text-center">
              14-day free trial · No credit card · Cancel anytime
            </p>
          </div>
        </div>
      )}
    </>
  );
}
