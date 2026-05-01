"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Settings, Zap, LogOut, Code2, MessageSquare, MapPin } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", icon: BarChart3,     label: "Dashboard",    shortcut: "G D" },
  { href: "/reviews",   icon: MessageSquare, label: "Reviews",       shortcut: "G R" },
  { href: "/rank",      icon: MapPin,        label: "Rank Tracker",  shortcut: "G K" },
  { href: "/schema",    icon: Code2,         label: "Schema Markup", shortcut: null  },
  { href: "/settings",  icon: Settings,      label: "Settings",      shortcut: "G S" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

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

  const handleSignOut = async () => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
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
              HVAC SEO Bot
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
            <p className="text-xs font-semibold text-zinc-400">Free</p>
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
            <span className="text-sm font-semibold text-zinc-100">HVAC SEO Bot</span>
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

      {/* ── Mobile bottom nav ────────────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-white/[0.06] bg-zinc-950/90 backdrop-blur-sm">
        <div className="flex items-center justify-around h-16">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors duration-150 ${
                  active ? "text-zinc-100" : "text-zinc-600 hover:text-zinc-300"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
