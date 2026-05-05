import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import SettingsTabs from "@/components/app/SettingsTabs";

export const metadata: Metadata = {
  title: "Settings — HeatRank AI",
};

// Must stay in sync with src/lib/usage.ts FREE_LIMITS (Starter plan limits)
const FREE_LIMITS: Record<string, number> = {
  keyword_generation: 1,
  review_reply: 3,
};

const FEATURE_LABELS: Record<string, string> = {
  keyword_generation: "AI Keyword Generations",
  review_reply: "AI Review Replies",
};

const VALID_TABS = ["profile", "usage", "billing", "danger"] as const;
type TabId = (typeof VALID_TABS)[number];

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const initialTab: TabId = VALID_TABS.includes(tab as TabId)
    ? (tab as TabId)
    : "profile";
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/login");

  // Fetch AI usage for the current calendar month
  const periodStart = new Date();
  periodStart.setDate(1);
  const periodStartStr = periodStart.toISOString().split("T")[0]; // YYYY-MM-DD

  const [{ data: usageRows }, { data: profile }] = await Promise.all([
    supabase
      .from("ai_usage")
      .select("feature, count")
      .eq("user_id", user.id)
      .eq("period_start", periodStartStr),
    supabase
      .from("profiles")
      .select("full_name, plan")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const usageMap = Object.fromEntries(
    (usageRows ?? []).map((r) => [r.feature, r.count as number])
  );

  const devMode = process.env.NODE_ENV === "development";
  const displayName: string =
    profile?.full_name ??
    (user.user_metadata?.full_name as string | undefined) ??
    "";
  const currentPlan = (profile?.plan as "starter" | "pro" | "agency") ?? "starter";

  // Build usage items — in dev mode limits are null so the bar shows "Dev Mode"
  const usageItems = Object.entries(FREE_LIMITS).map(([feature, limit]) => ({
    feature,
    label: FEATURE_LABELS[feature] ?? feature,
    count: usageMap[feature] ?? 0,
    limit: devMode ? null : limit,
    devMode,
  }));

  return (
    <>
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-zinc-800/8 rounded-full blur-[120px]" />
      </div>

      <main className="relative max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2">
            Account
          </p>
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Settings</h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            Manage your profile, API usage, and billing.
          </p>
        </div>

        <SettingsTabs
          userId={user.id}
          email={user.email ?? ""}
          initialName={displayName}
          usageItems={usageItems}
          initialTab={initialTab}
          currentPlan={currentPlan}
        />
      </main>
    </>
  );
}
