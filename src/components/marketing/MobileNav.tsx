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
        <div className="fixed inset-0 z-50 sm:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-0 right-0 bottom-0 w-[85vw] max-w-xs bg-zinc-950 border-l border-white/[0.10] flex flex-col">
            <div className="flex items-center justify-between px-5 h-14 border-b border-white/[0.06]">
              <span className="text-sm font-semibold text-zinc-200">Menu</span>
              <button
                onClick={() => setOpen(false)}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.05]"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-3">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-5 py-3 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-white/[0.04] transition-colors"
                >
                  <span>{l.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-700" />
                </Link>
              ))}
            </nav>

            <div className="p-5 border-t border-white/[0.06] space-y-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100 transition-all"
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
          </div>
        </div>
      )}
    </>
  );
}
