"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

type Plan = "starter" | "pro" | "agency";

const PLAN_RANK: Record<Plan, number> = { starter: 0, pro: 1, agency: 2 };

const PLAN_LABELS: Record<Plan, string> = {
  starter: "Starter",
  pro: "Pro",
  agency: "Agency",
};

interface Props {
  plan: Plan;
  requiredPlan: "pro" | "agency";
  feature: string;
  children: React.ReactNode;
  /** If true, shows a compact inline badge instead of a full overlay */
  inline?: boolean;
}

export default function UpgradeGate({
  plan,
  requiredPlan,
  feature,
  children,
  inline = false,
}: Props) {
  const hasAccess = PLAN_RANK[plan] >= PLAN_RANK[requiredPlan];
  if (hasAccess) return <>{children}</>;

  if (inline) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
          <Lock className="w-2.5 h-2.5" />
          {PLAN_LABELS[requiredPlan]}+
        </span>
        <Link
          href="/settings?tab=billing"
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-2"
        >
          Upgrade
        </Link>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Blurred content preview */}
      <div className="select-none pointer-events-none blur-sm opacity-40">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/70 backdrop-blur-[2px] rounded-2xl">
        <div className="flex flex-col items-center text-center max-w-xs px-6 py-8 gap-4">
          <div className="w-10 h-10 rounded-2xl bg-white/[0.05] border border-white/[0.10] flex items-center justify-center">
            <Lock className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-200 mb-1">
              {PLAN_LABELS[requiredPlan]} feature
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              {feature} is available on the {PLAN_LABELS[requiredPlan]} plan and above.
              Upgrade to unlock it.
            </p>
          </div>
          <Link
            href="/settings?tab=billing"
            className="px-4 py-2 rounded-xl bg-white text-zinc-950 text-sm font-bold hover:bg-zinc-100 active:scale-[0.98] transition-all duration-150 shadow-lg shadow-black/20"
          >
            Upgrade to {PLAN_LABELS[requiredPlan]}
          </Link>
        </div>
      </div>
    </div>
  );
}
