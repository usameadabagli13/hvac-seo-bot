"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X, ChevronRight } from "lucide-react";

interface NavLink { href: string; label: string; sub?: string; }
interface Group   { title: string; links: NavLink[]; }

// Same content the desktop header shows — broken into clear sections so
// mobile users can navigate everything in the site at a glance.
const GROUPS: Group[] = [
  {
    title: "Product",
    links: [
      { href: "/#features",    label: "Features",      sub: "Everything in HeatRank AI" },
      { href: "/pricing",      label: "Pricing",       sub: "Plans & 14-day free trial" },
      { href: "/case-studies", label: "Case studies",  sub: "Real HVAC contractor results" },
    ],
  },
  {
    title: "Compare",
    links: [
      { href: "/vs-seo-agency", label: "vs hiring an SEO agency" },
      { href: "/vs-podium",     label: "vs Podium" },
      { href: "/vs-birdeye",    label: "vs Birdeye" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/resources",    label: "SEO tips & guides" },
      { href: "/tools",        label: "Free tools" },
      { href: "/glossary",     label: "SEO glossary" },
      { href: "/integrations", label: "Integrations" },
      { href: "/faq",          label: "FAQ" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about",     label: "About" },
      { href: "/roadmap",   label: "Roadmap" },
      { href: "/changelog", label: "Changelog" },
      { href: "/contact",   label: "Contact" },
    ],
  },
];

export default function MobileNav() {
  const [open,    setOpen]    = useState(false);
  const [mounted, setMounted] = useState(false);

  // Required so the portal only renders client-side (avoids SSR mismatch).
  useEffect(() => { setMounted(true); }, []);

  // Lock body scroll when the drawer is open.
  useEffect(() => {
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = original; };
    }
  }, [open]);

  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const drawer = open && (
    <div
      // Full viewport overlay rendered at <body> level so no ancestor with
      // `transform`/`overflow:hidden` can clip it. dvh > vh on mobile to
      // respect iOS Safari's dynamic browser chrome.
      style={{ height: "100dvh" }}
      className="fixed inset-0 z-[100] sm:hidden bg-zinc-950 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 h-14 border-b border-white/[0.08] flex-shrink-0">
        <span className="text-sm font-semibold text-zinc-100 tracking-tight">Menu</span>
        <button
          onClick={() => setOpen(false)}
          className="flex items-center justify-center w-10 h-10 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.05] active:bg-white/[0.08]"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable body — CTAs + grouped links */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {/* CTAs */}
        <div className="px-5 pt-4 pb-5 space-y-2.5 border-b border-white/[0.06]">
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
            className="flex items-center justify-center gap-2 w-full h-12 rounded-xl border border-white/[0.16] bg-zinc-900 text-zinc-100 text-base font-semibold hover:bg-zinc-800 active:bg-zinc-800 transition-all"
          >
            Sign in
          </Link>
          <p className="text-[11px] text-zinc-500 text-center pt-1.5">
            14-day free trial · No credit card · Cancel anytime
          </p>
        </div>

        {/* Grouped links */}
        {GROUPS.map((group) => (
          <div key={group.title} className="px-2 py-3 border-b border-white/[0.04] last:border-b-0">
            <p className="px-3 mb-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
              {group.title}
            </p>
            {group.links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between gap-3 px-3 py-3 rounded-lg text-zinc-100 hover:bg-white/[0.04] active:bg-white/[0.06] transition-colors"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium leading-tight">{l.label}</span>
                  {l.sub && (
                    <span className="block text-[11px] text-zinc-500 mt-0.5 leading-tight">{l.sub}</span>
                  )}
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-600 flex-shrink-0" />
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* Footer trust strip */}
      <div className="px-5 py-3 border-t border-white/[0.06] flex-shrink-0 flex items-center justify-center gap-2 text-[10px] text-zinc-600">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        SOC 2 · GDPR · 99.9% uptime
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="sm:hidden flex items-center justify-center w-10 h-10 rounded-lg border border-white/[0.10] bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06] active:bg-white/[0.08] transition-all"
        aria-label="Open menu"
        aria-expanded={open}
      >
        <Menu className="w-5 h-5" />
      </button>

      {mounted && drawer && createPortal(drawer, document.body)}
    </>
  );
}
