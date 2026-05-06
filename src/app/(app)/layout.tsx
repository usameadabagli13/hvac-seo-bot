import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Sidebar from "@/components/app/Sidebar";
import TrialBanner from "@/components/app/TrialBanner";
import OnboardingTour from "@/components/app/OnboardingTour";
import { resolveTrialState } from "@/lib/trial";
import { getOnboardingState } from "@/lib/onboarding";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const periodStart = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`;

  const [{ plan, isOnTrial, trialDaysLeft, trialExpired }, { data: usageRows }, onboarding, { data: profileRow }] = await Promise.all([
    resolveTrialState(supabase, session.user.id),
    supabase
      .from("ai_usage")
      .select("feature, count")
      .eq("user_id", session.user.id)
      .eq("period_start", periodStart),
    getOnboardingState(supabase, session.user.id),
    supabase
      .from("profiles")
      .select("is_founder")
      .eq("user_id", session.user.id)
      .maybeSingle(),
  ]);

  const isFounder = !!profileRow?.is_founder;

  const usage: Record<string, number> = {};
  for (const row of usageRows ?? []) {
    usage[row.feature] = row.count;
  }

  const showBanner = isOnTrial || trialExpired;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Sidebar plan={plan} usage={usage} isFounder={isFounder} />
      <div className="lg:pl-56 pb-16 lg:pb-0">
        {showBanner && (
          <TrialBanner trialDaysLeft={trialDaysLeft} trialExpired={trialExpired} />
        )}
        {children}
      </div>
      <OnboardingTour state={onboarding} />
    </div>
  );
}
