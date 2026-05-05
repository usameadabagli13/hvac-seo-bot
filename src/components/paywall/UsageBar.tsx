"use client";

import Link from "next/link";

interface Props {
  label: string;
  count: number;
  limit: number | null; // null = unlimited (Pro/Agency)
  devMode?: boolean;
}

export default function UsageBar({ label, count, limit, devMode }: Props) {
  if (devMode) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 font-medium">{label}</span>
          <span className="text-zinc-600">Dev mode — no limits</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/[0.06]">
          <div className="h-full w-1/3 rounded-full bg-zinc-700" />
        </div>
      </div>
    );
  }

  if (limit === null) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 font-medium">{label}</span>
          <span className="text-emerald-400 font-medium">Unlimited</span>
        </div>
        <div className="h-1.5 rounded-full bg-emerald-500/20">
          <div className="h-full w-full rounded-full bg-emerald-500/40" />
        </div>
      </div>
    );
  }

  const pct = Math.min((count / limit) * 100, 100);
  const isNearLimit = pct >= 80;
  const isAtLimit = count >= limit;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-400 font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className={isAtLimit ? "text-rose-400 font-semibold" : isNearLimit ? "text-amber-400" : "text-zinc-500"}>
            {count} / {limit} used
          </span>
          {isAtLimit && (
            <Link
              href="/settings?tab=billing"
              className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold hover:bg-amber-500/20 transition-colors"
            >
              Upgrade
            </Link>
          )}
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isAtLimit ? "bg-rose-500/70" : isNearLimit ? "bg-amber-500/60" : "bg-zinc-500/60"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
