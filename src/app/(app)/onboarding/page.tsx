import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import OnboardingWizard from "./OnboardingWizard";

export const metadata: Metadata = {
  title: "Get Started — HeatRank AI",
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_complete, full_name")
    .eq("user_id", user.id)
    .maybeSingle();

  // Already onboarded — send to dashboard
  if (profile?.onboarding_complete) redirect("/dashboard");

  const initialName =
    profile?.full_name ??
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    "";

  return <OnboardingWizard userId={user.id} initialName={initialName} />;
}
