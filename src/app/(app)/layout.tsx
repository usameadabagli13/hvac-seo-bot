import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Sidebar from "@/components/app/Sidebar";
import TrialBanner from "@/components/app/TrialBanner";
import { resolveTrialState } from "@/lib/trial";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { plan, isOnTrial, trialDaysLeft, trialExpired } = await resolveTrialState(
    supabase,
    session.user.id,
  );

  const showBanner = isOnTrial || trialExpired;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Sidebar plan={plan} />
      <div className="lg:pl-56 pb-16 lg:pb-0">
        {showBanner && (
          <TrialBanner trialDaysLeft={trialDaysLeft} trialExpired={trialExpired} />
        )}
        {children}
      </div>
    </div>
  );
}
