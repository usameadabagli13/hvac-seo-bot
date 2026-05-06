"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { deleteAccount } from "@/app/(app)/settings/actions";
import { Loader2, Check, AlertTriangle, User, BarChart2, CreditCard, Trash2, Camera, X } from "lucide-react";
import type { Plan, BillingInterval } from "@/lib/dodo";

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
  initialAvatarUrl: string | null;
  usageItems: UsageItem[];
  initialTab: "profile" | "usage" | "billing" | "danger";
  currentPlan: Plan;
  hasDodoCustomer: boolean;
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

// ── Billing plan definitions ──────────────────────────────────────────────────
const BILLING_PLANS: {
  id: Plan;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  desc: string;
  highlight: boolean;
  features: string[];
}[] = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 39,
    annualPrice: 32,
    desc: "For solo contractors exploring SEO.",
    highlight: false,
    features: [
      "1 business",
      "1 AI keyword generation / mo",
      "3 AI review replies / mo",
      "Basic schema markup",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 69,
    annualPrice: 55,
    desc: "Everything you need to dominate local search.",
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
    id: "agency",
    name: "Agency",
    monthlyPrice: 199,
    annualPrice: 159,
    desc: "For agencies managing multiple HVAC clients.",
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
export default function SettingsTabs({ userId, email, initialName, initialAvatarUrl, usageItems, initialTab, currentPlan, hasDodoCustomer }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [isAnnual, setIsAnnual] = useState(true);

  // Profile state
  const [displayName, setDisplayName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Billing state
  const [upgradingPlan, setUpgradingPlan] = useState<Plan | null>(null);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [portalBusy,  setPortalBusy]  = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  // Danger zone state
  const [confirmInput, setConfirmInput] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError(null);

    // Validate
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!["jpg", "jpeg", "png", "webp"].includes(ext)) {
      setAvatarError("Use a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Image must be under 2 MB.");
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const path = `${userId}/avatar.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, cacheControl: "3600" });

      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      // Cache-bust so the new image shows immediately
      const publicUrl = `${urlData.publicUrl}?v=${Date.now()}`;

      const { error: dbErr } = await supabase
        .from("profiles")
        .upsert({ user_id: userId, avatar_url: publicUrl }, { onConflict: "user_id" });

      if (dbErr) throw dbErr;

      setAvatarUrl(publicUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      setAvatarError(msg);
    } finally {
      setUploading(false);
      // Allow re-uploading the same filename
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAvatarRemove = async () => {
    if (!avatarUrl) return;
    setAvatarError(null);
    setUploading(true);
    try {
      const supabase = createClient();
      // Try removing all common extensions; ignore individual failures
      await supabase.storage.from("avatars").remove([
        `${userId}/avatar.jpg`,
        `${userId}/avatar.jpeg`,
        `${userId}/avatar.png`,
        `${userId}/avatar.webp`,
      ]);
      const { error: dbErr } = await supabase
        .from("profiles")
        .upsert({ user_id: userId, avatar_url: null }, { onConflict: "user_id" });
      if (dbErr) throw dbErr;
      setAvatarUrl(null);
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Remove failed.");
    } finally {
      setUploading(false);
    }
  };

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

  const handleUpgrade = async (plan: Plan) => {
    setUpgradingPlan(plan);
    setUpgradeError(null);
    try {
      const interval: BillingInterval = isAnnual ? "yearly" : "monthly";
      const res = await fetch("/api/dodo/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, interval }),
      });
      const json = await res.json() as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        throw new Error(json.error ?? "Could not start checkout. Please try again.");
      }
      window.location.href = json.url;
    } catch (err) {
      setUpgradeError(err instanceof Error ? err.message : "Unexpected error.");
      setUpgradingPlan(null);
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
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="relative group w-14 h-14 rounded-2xl bg-zinc-800 border border-white/[0.08] flex items-center justify-center text-xl font-bold text-zinc-300 select-none flex-shrink-0 overflow-hidden hover:border-white/[0.18] transition-colors disabled:opacity-60"
              title={avatarUrl ? "Change avatar" : "Upload avatar"}
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Avatar"
                  fill
                  sizes="56px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                (displayName || email)[0].toUpperCase()
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity">
                {uploading
                  ? <Loader2 className="w-4 h-4 animate-spin text-zinc-200" />
                  : <Camera   className="w-4 h-4 text-zinc-200" />
                }
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200">
                {displayName || email.split("@")[0]}
              </p>
              <p className="text-xs text-zinc-600">{email}</p>
              <div className="mt-1.5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50"
                >
                  {avatarUrl ? "Change" : "Upload photo"}
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleAvatarRemove}
                    disabled={uploading}
                    className="flex items-center gap-1 text-[11px] text-zinc-600 hover:text-rose-400 transition-colors disabled:opacity-50"
                  >
                    <X className="w-3 h-3" />
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
          {avatarError && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
              {avatarError}
            </p>
          )}

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
          {/* Manage existing subscription */}
          {hasDodoCustomer && (
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-zinc-200">Manage your subscription</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Change plan, update card, or cancel via the secure Dodo Payments portal.
                </p>
              </div>
              <button
                onClick={async () => {
                  setPortalBusy(true);
                  setPortalError(null);
                  try {
                    const res = await fetch("/api/dodo/portal", { method: "POST" });
                    const data = await res.json() as { url?: string; error?: string };
                    if (!res.ok || !data.url) throw new Error(data.error ?? "Could not open portal.");
                    window.location.href = data.url;
                  } catch (err) {
                    setPortalError(err instanceof Error ? err.message : "Unknown error.");
                    setPortalBusy(false);
                  }
                }}
                disabled={portalBusy}
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.10] text-xs font-semibold text-zinc-200 hover:bg-white/[0.10] hover:border-white/[0.18] transition-all disabled:opacity-50"
              >
                {portalBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                {portalBusy ? "Opening…" : "Manage"}
              </button>
            </div>
          )}
          {portalError && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5">
              {portalError}
            </p>
          )}

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

          {/* Upgrade error */}
          {upgradeError && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5">
              {upgradeError}
            </p>
          )}

          {/* Plan cards */}
          {BILLING_PLANS.map((plan) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const savings = (plan.monthlyPrice - plan.annualPrice) * 12;
            const isCurrent = plan.id === currentPlan;
            const isLoading = upgradingPlan === plan.id;

            if (plan.highlight) {
              return (
                <div key={plan.id} className="relative rounded-2xl overflow-hidden">
                  {/* Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-transparent pointer-events-none" />
                  <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-zinc-400/40 via-zinc-600/20 to-transparent pointer-events-none" />

                  <div className="relative rounded-2xl border border-white/[0.20] bg-zinc-900 px-5 py-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-base font-bold text-white">{plan.name}</p>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-zinc-950 text-[10px] font-bold uppercase tracking-widest">
                            ✦ Most Popular
                          </span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                              Current
                            </span>
                          )}
                        </div>
                        {isAnnual && savings > 0 ? (
                          <p className="text-[11px] text-emerald-400 font-medium">
                            Billed annually · Save ${savings}/year
                          </p>
                        ) : (
                          <p className="text-xs text-zinc-400">{plan.desc}</p>
                        )}
                      </div>

                      <div className="flex-shrink-0 text-right">
                        {isAnnual && (
                          <span className="block text-xs text-zinc-500 line-through">
                            ${plan.monthlyPrice}
                          </span>
                        )}
                        <span className="text-2xl font-bold text-white">
                          ${price}
                          <span className="text-xs font-normal text-zinc-400">/mo</span>
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/[0.10] grid grid-cols-2 gap-x-4 gap-y-1.5">
                      {plan.features.map((f) => (
                        <div key={f} className="flex items-center gap-1.5 text-xs text-zinc-300">
                          <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                          {f}
                        </div>
                      ))}
                    </div>

                    {isCurrent ? (
                      <div className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.10] text-sm font-semibold text-zinc-400 text-center">
                        Current Plan
                      </div>
                    ) : (
                      <button
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={isLoading || upgradingPlan !== null}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-zinc-950 text-sm font-bold hover:bg-zinc-100 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:pointer-events-none shadow-lg shadow-black/20"
                      >
                        {isLoading ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting…</>
                        ) : (
                          `Upgrade to ${plan.name}`
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={plan.id}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-base font-semibold text-zinc-100">{plan.name}</p>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-zinc-700/50 border border-white/[0.07] text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                          Current Plan
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
                    <div key={f} className={`flex items-center gap-1.5 text-xs ${isCurrent ? "text-zinc-500" : "text-zinc-400"}`}>
                      <Check className={`w-3 h-3 flex-shrink-0 ${isCurrent ? "text-zinc-600" : "text-zinc-500"}`} />
                      {f}
                    </div>
                  ))}
                </div>

                {!isCurrent && (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isLoading || upgradingPlan !== null}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.10] text-sm font-semibold text-zinc-300 hover:bg-white/[0.10] hover:text-zinc-100 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:pointer-events-none"
                  >
                    {isLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting…</>
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
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
