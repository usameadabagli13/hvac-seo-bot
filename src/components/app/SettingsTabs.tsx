"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/utils/supabase/client";
import { deleteAccount } from "@/app/(app)/settings/actions";
import { Loader2, Check, AlertTriangle, User, BarChart2, CreditCard, Trash2 } from "lucide-react";

interface UsageItem {
  feature: string;
  label: string;
  count: number;
  limit: number | null; // null = unlimited (dev mode or uncapped feature)
  devMode?: boolean;
}

interface Props {
  userId: string;
  email: string;
  initialName: string;
  usageItems: UsageItem[];
  initialTab: "profile" | "usage" | "billing" | "danger";
}

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "usage", label: "API Usage", icon: BarChart2 },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "danger", label: "Danger Zone", icon: Trash2 },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ── Usage progress bar ────────────────────────────────────────────────────────
function UsageBar({ item }: { item: UsageItem }) {
  if (item.devMode || item.limit === null) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-300">{item.label}</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-500 bg-white/[0.04] border border-white/[0.07] rounded-md px-2 py-0.5 uppercase tracking-wider">
            Dev Mode · Unlimited
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div className="h-full w-full rounded-full bg-zinc-700 opacity-40" />
        </div>
        <p className="text-[11px] text-zinc-700">
          Rate limits are disabled in development. Limits apply in production.
        </p>
      </div>
    );
  }

  const pct = Math.min((item.count / item.limit) * 100, 100);
  const nearLimit = item.count / item.limit >= 0.8;
  const atLimit = item.count >= item.limit;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-300">{item.label}</span>
        <span className={`text-xs font-medium tabular-nums ${atLimit ? "text-rose-400" : "text-zinc-500"}`}>
          {item.count} / {item.limit}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            atLimit ? "bg-rose-400" : nearLimit ? "bg-amber-400" : "bg-zinc-400"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {atLimit && (
        <p className="text-[11px] text-rose-400">
          Monthly limit reached — upgrade to Pro for unlimited generations.
        </p>
      )}
    </div>
  );
}

// ── Billing data ──────────────────────────────────────────────────────────────
const BILLING_PLANS = [
  {
    name: "Starter",
    monthlyPrice: 39,
    annualPrice: 32,
    desc: "For solo contractors exploring SEO.",
    current: true,
    highlight: false,
    features: [
      "1 business",
      "1 AI keyword generation / mo",
      "3 AI review replies / mo",
      "Basic schema markup",
    ],
  },
  {
    name: "Pro",
    monthlyPrice: 69,
    annualPrice: 55,
    desc: "Everything you need to dominate local search.",
    current: false,
    highlight: true,
    features: [
      "5 businesses",
      "Unlimited AI keywords",
      "Unlimited review replies",
      "Full schema markup",
      "Unlimited SEO audits",
      "Weekly rank snapshots",
      "Competitor tracking (3 rivals)",
      "Weekly PDF reports",
      "Priority support",
    ],
  },
  {
    name: "Agency",
    monthlyPrice: 199,
    annualPrice: 159,
    desc: "For agencies managing multiple HVAC clients.",
    current: false,
    highlight: false,
    features: [
      "Unlimited businesses",
      "Unlimited AI keywords",
      "Unlimited review replies",
      "Full schema markup",
      "Unlimited SEO audits",
      "Daily rank snapshots",
      "Competitor tracking (10 rivals)",
      "Daily PDF reports",
      "White-label reports",
      "Sub-account management",
      "Priority support",
    ],
  },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function SettingsTabs({ userId, email, initialName, usageItems, initialTab }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [isAnnual, setIsAnnual] = useState(true);

  // Profile state
  const [displayName, setDisplayName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Danger zone state
  const [confirmInput, setConfirmInput] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const supabase = createClient();
      const name = displayName.trim() || null;
      // Write to both auth metadata (keeps session in sync) and profiles table
      const [authResult, profileResult] = await Promise.all([
        supabase.auth.updateUser({ data: { full_name: name } }),
        supabase
          .from("profiles")
          .upsert({ user_id: userId, full_name: name }, { onConflict: "user_id" }),
      ]);
      if (authResult.error) throw authResult.error;
      if (profileResult.error) throw profileResult.error;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteAccount();
    });
  };

  const canDelete = confirmInput === "DELETE";

  return (
    <div className="space-y-6">
      {/* ── Tab bar ──────────────────────────────────────────────────────── */}
      <div className="flex gap-0.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-full sm:w-fit overflow-x-auto scrollbar-none">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === id
                ? "bg-white/[0.08] text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
            } ${id === "danger" && activeTab !== "danger" ? "hover:text-rose-400" : ""}`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Profile tab ──────────────────────────────────────────────────── */}
      {activeTab === "profile" && (
        <div className="max-w-md space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-white/[0.08] flex items-center justify-center text-xl font-bold text-zinc-300 select-none flex-shrink-0">
              {(displayName || email)[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200">
                {displayName || email.split("@")[0]}
              </p>
              <p className="text-xs text-zinc-600">{email}</p>
            </div>
          </div>

          {/* Display name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              maxLength={80}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all duration-200"
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Email
            </label>
            <div className="px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-sm text-zinc-500">
              {email}
            </div>
            <p className="text-[11px] text-zinc-700">
              Email is managed by your Google account and cannot be changed here.
            </p>
          </div>

          {saveError && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
              {saveError}
            </p>
          )}

          <button
            onClick={handleSaveProfile}
            disabled={saving || saved}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:pointer-events-none shadow-lg shadow-black/20"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
            ) : saved ? (
              <><Check className="w-4 h-4 text-emerald-600" /> Saved</>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      )}

      {/* ── API Usage tab ─────────────────────────────────────────────────── */}
      {activeTab === "usage" && (
        <div className="max-w-md space-y-6">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-5 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">Monthly Usage</h3>
                <p className="text-xs text-zinc-600 mt-0.5">Resets on the 1st of each month</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.07] text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                Starter
              </span>
            </div>

            <div className="space-y-5 pt-1 border-t border-white/[0.05]">
              {usageItems.length === 0 ? (
                <p className="text-xs text-zinc-600">No usage recorded this month.</p>
              ) : (
                usageItems.map((item) => <UsageBar key={item.feature} item={item} />)
              )}
            </div>
          </div>

          <p className="text-xs text-zinc-600 leading-relaxed">
            Upgrade to <span className="text-zinc-400 font-medium">Pro</span> for unlimited AI keyword
            generations, review replies, and SEO audits.
          </p>
        </div>
      )}

      {/* ── Billing tab ──────────────────────────────────────────────────── */}
      {activeTab === "billing" && (
        <div className="space-y-5 max-w-2xl">
          {/* Toggle */}
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium transition-colors duration-200 ${!isAnnual ? "text-zinc-200" : "text-zinc-600"}`}>
              Monthly
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isAnnual}
              onClick={() => setIsAnnual((v) => !v)}
              className="relative w-12 h-6 rounded-full bg-zinc-800 border border-white/[0.10] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/10"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  isAnnual ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-sm font-medium transition-colors duration-200 ${isAnnual ? "text-zinc-200" : "text-zinc-600"}`}>
              Yearly
            </span>
            {isAnnual && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                Save 20%
              </span>
            )}
          </div>

          {/* Plan cards */}
          {BILLING_PLANS.map((plan) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const savings = (plan.monthlyPrice - plan.annualPrice) * 12;

            return (
              <div
                key={plan.name}
                className={`rounded-2xl border px-5 py-5 space-y-4 ${
                  plan.highlight
                    ? "border-white/[0.14] bg-white/[0.03] ring-1 ring-white/[0.06]"
                    : "border-white/[0.08] bg-white/[0.02]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-base font-semibold text-zinc-100">{plan.name}</p>
                      {plan.current && (
                        <span className="px-2 py-0.5 rounded-full bg-zinc-700/50 border border-white/[0.07] text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                          Current Plan
                        </span>
                      )}
                      {plan.highlight && (
                        <span className="px-2 py-0.5 rounded-full bg-white/[0.07] border border-white/[0.12] text-[10px] font-semibold text-zinc-300 uppercase tracking-widest">
                          Most Popular
                        </span>
                      )}
                    </div>
                    {isAnnual && savings > 0 ? (
                      <p className="text-[11px] text-emerald-400 font-medium">
                        Billed annually · Save ${savings}/year
                      </p>
                    ) : (
                      <p className="text-xs text-zinc-500">{plan.desc}</p>
                    )}
                  </div>

                  <div className="flex-shrink-0 text-right">
                    {isAnnual && (
                      <span className="block text-xs text-zinc-600 line-through">
                        ${plan.monthlyPrice}
                      </span>
                    )}
                    <span className="text-xl font-bold text-zinc-100">
                      ${price}
                      <span className="text-xs font-normal text-zinc-500">/mo</span>
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.05] grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {plan.features.map((f) => (
                    <div key={f} className={`flex items-center gap-1.5 text-xs ${plan.current ? "text-zinc-500" : "text-zinc-400"}`}>
                      <Check className={`w-3 h-3 flex-shrink-0 ${plan.current ? "text-zinc-600" : "text-zinc-500"}`} />
                      {f}
                    </div>
                  ))}
                </div>

                {!plan.current && (
                  <button
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.10] text-sm font-semibold text-zinc-400 cursor-not-allowed"
                  >
                    Payments coming soon
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Danger Zone tab ───────────────────────────────────────────────── */}
      {activeTab === "danger" && (
        <div className="max-w-md space-y-5">
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.03] px-5 py-5 space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-zinc-100 mb-1">Delete Account</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  This permanently deletes your account, all saved businesses, keyword data,
                  and usage history. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Type <span className="text-rose-400 font-bold">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="DELETE"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-rose-500/30 focus:ring-1 focus:ring-rose-500/20 transition-all duration-200 font-mono"
              />
            </div>

            <button
              onClick={handleDelete}
              disabled={!canDelete || isPending}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-sm font-semibold text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/50 active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none"
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Deleting…</>
              ) : (
                <><Trash2 className="w-4 h-4" /> Permanently Delete Account</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
