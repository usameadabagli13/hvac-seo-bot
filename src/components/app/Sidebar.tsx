"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Settings, Zap, LogOut, Code2, MessageSquare, MapPin, CreditCard, MoreHorizontal, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const NAV_ITEMS = [
  { href: "/dashboard",            icon: BarChart3,     label: "Dashboard",    shortcut: "G D" },
  { href: "/reviews",              icon: MessageSquare, label: "Reviews",       shortcut: "G R" },
  { href: "/rank",                 icon: MapPin,        label: "Rank Tracker",  shortcut: "G K" },
  { href: "/schema",               icon: Code2,         label: "Schema Markup", shortcut: null  },
  { href: "/settings",             icon: Settings,      label: "Settings",      shortcut: "G S" },
  { href: "/settings?tab=billing", icon: CreditCard,    label: "Billing",       shortcut: null  },
];

// Mobile bottom nav — 4 primary + "More" drawer for the rest
const MOBILE_PRIMARY = [
  { href: "/dashboard",            icon: BarChart3,     label: "Dashboard" },
  { href: "/reviews",              icon: MessageSquare, label: "Reviews"   },
  { href: "/rank",                 icon: MapPin,        label: "Rank"      },
  { href: "/settings?tab=billing", icon: CreditCard,    label: "Billing"   },
];

const MOBILE_MORE = [
  { href: "/schema",   icon: Code2,     label: "Schema Markup" },
  { href: "/settings", icon: Settings,  label: "Settings"      },
];

const PLAN_LABELS: Record<"starter" | "pro" | "agency", string> = {
  starter: "Starter",
  pro:     "Pro",
  agency:  "Agency",
};

export default function Sidebar({ plan = "starter" }: { plan?: "starter" | "pro" | "agency" }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Chord shortcuts: G → D = /dashboard, G → S = /settings
  useEffect(() => {
    let gArmed = false;
    let armTimer: ReturnType<typeof setTimeout>;

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) return;

      if (e.key === "g" || e.key === "G") {
        gArmed = true;
        clearTimeout(armTimer);
        armTimer = setTimeout(() => { gArmed = false; }, 1000);
        return;
      }

      if (gArmed) {
        if (e.key === "d" || e.key === "D") {
          e.preventDefault();
          router.push("/dashboard");
        } else if (e.key === "r" || e.key === "R") {
          e.preventDefault();
          router.push("/reviews");
        } else if (e.key === "k" || e.key === "K") {
          e.preventDefault();
          router.push("/rank");
        } else if (e.key === "s" || e.key === "S") {
          e.preventDefault();
          router.push("/settings");
        }
        gArmed = false;
        clearTimeout(armTimer);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      clearTimeout(armTimer);
    };
  }, [router]);

  // Close "More" sheet on navigation
  useEffect(() => { setMoreOpen(false); }, [pathname]);

  const handleSignOut = () => {
    setSigningOut(true);
    // Server-side sign out: clears session cookies via Set-Cookie headers
    // on the redirect response, guaranteeing the browser drops the session.
    window.location.href = "/auth/signout";
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-56 border-r border-white/[0.06] bg-zinc-950 fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="px-4 h-14 flex items-center border-b border-white/[0.06] flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-white/[0.05] border border-white/[0.10] group-hover:border-white/[0.18] transition-colors duration-150">
              <Zap className="w-3.5 h-3.5 text-zinc-300" />
            </div>
            <span className="text-sm font-semibold text-zinc-100 tracking-tight">
              HeatRank AI
            </span>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, icon: Icon, label, shortcut }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                  active
                    ? "bg-white/[0.07] text-zinc-100 font-medium"
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04]"
                }`}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    active ? "text-zinc-300" : "text-zinc-600"
                  }`}
                />
                <span className="flex-1">{label}</span>
                {shortcut && (
                  <span className="hidden group-hover:flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    {shortcut.split(" ").map((k) => (
                      <kbd
                        key={k}
                        className="inline-flex items-center justify-center w-4 h-4 rounded bg-white/[0.06] border border-white/[0.09] text-[9px] font-semibold text-zinc-500"
                      >
                        {k}
                      </kbd>
                    ))}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Plan badge + sign out */}
        <div className="px-3 py-4 border-t border-white/[0.06] space-y-2 flex-shrink-0">
          <Link
            href="/settings?tab=billing"
            className="block px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.10] hover:bg-white/[0.04] transition-colors duration-150"
          >
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-0.5">
              Plan
            </p>
            <p className={`text-xs font-semibold ${plan === "pro" ? "text-emerald-400" : plan === "agency" ? "text-amber-400" : "text-zinc-400"}`}>
              {PLAN_LABELS[plan]}
            </p>
          </Link>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.04] transition-colors duration-150 disabled:opacity-40"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ───────────────────────────────────────────────── */}
      <header className="lg:hidden sticky top-0 z-20 border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-sm">
        <div className="px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-white/[0.05] border border-white/[0.10]">
              <Zap className="w-3.5 h-3.5 text-zinc-300" />
            </div>
            <span className="text-sm font-semibold text-zinc-100">HeatRank AI</span>
          </Link>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-400 border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-colors disabled:opacity-40"
          >
            <LogOut className="w-3 h-3" />
            Sign out
          </button>
        </div>
      </header>

      {/* ── Mobile "More" sheet ──────────────────────────────────────────── */}
      {moreOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMoreOpen(false)}
          />
          {/* Sheet */}
          <div
            ref={sheetRef}
            className="relative z-10 rounded-t-2xl border-t border-white/[0.08] bg-zinc-950 px-4 pb-8 pt-4"
          >
            {/* Handle */}
            <div className="mx-auto mb-4 w-10 h-1 rounded-full bg-white/[0.10]" />
            <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mb-3 px-1">
              More
            </p>
            <div className="space-y-1">
              {MOBILE_MORE.map(({ href, icon: Icon, label }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors duration-150 ${
                      active
                        ? "bg-white/[0.07] text-zinc-100"
                        : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                    }`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-zinc-300" : "text-zinc-600"}`} />
                    {label}
                  </Link>
                );
              })}
            </div>
            <button
              onClick={() => setMoreOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.04] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Mobile bottom nav ────────────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-white/[0.06] bg-zinc-950/90 backdrop-blur-sm">
        <div className="flex items-center justify-around h-16">
          {MOBILE_PRIMARY.map(({ href, icon: Icon, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 px-3 py-2 transition-colors duration-150 ${
                  active ? "text-zinc-100" : "text-zinc-600 hover:text-zinc-300"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen((v) => !v)}
            className={`flex flex-col items-center gap-1 px-3 py-2 transition-colors duration-150 ${
              moreOpen ? "text-zinc-100" : "text-zinc-600 hover:text-zinc-300"
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-xs font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
