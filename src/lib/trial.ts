import type { SupabaseClient } from "@supabase/supabase-js";

export type Plan = "starter" | "pro" | "agency";

export interface TrialState {
  plan: Plan;
  trialEndsAt: Date | null;
  isOnTrial: boolean;       // trial active right now
  trialDaysLeft: number;    // 0 if not on trial or expired
  trialExpired: boolean;    // had a trial, now past it (and no active subscription)
}

/**
 * Reads the user's plan + trial state. If the trial has expired, atomically
 * downgrades them to 'starter' so the rest of the app sees the new plan.
 *
 * trial_ends_at semantics:
 *   - NULL          → subscribed (or pre-trial legacy user)
 *   - future date   → active Pro trial
 *   - past date     → expired trial → downgrade to 'starter'
 */
export async function resolveTrialState(
  supabase: SupabaseClient,
  userId: string,
): Promise<TrialState> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, trial_ends_at")
    .eq("user_id", userId)
    .maybeSingle();

  const plan = (profile?.plan as Plan | undefined) ?? "starter";
  const trialEndsAt = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : null;

  if (!trialEndsAt) {
    return { plan, trialEndsAt: null, isOnTrial: false, trialDaysLeft: 0, trialExpired: false };
  }

  const now = Date.now();
  const msLeft = trialEndsAt.getTime() - now;

  if (msLeft > 0) {
    const daysLeft = Math.max(1, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
    return { plan, trialEndsAt, isOnTrial: true, trialDaysLeft: daysLeft, trialExpired: false };
  }

  // Trial expired. If they're still on pro/agency without paying, drop to starter.
  if (plan !== "starter") {
    await supabase
      .from("profiles")
      .update({ plan: "starter" })
      .eq("user_id", userId);
    return {
      plan: "starter",
      trialEndsAt,
      isOnTrial: false,
      trialDaysLeft: 0,
      trialExpired: true,
    };
  }

  return { plan, trialEndsAt, isOnTrial: false, trialDaysLeft: 0, trialExpired: true };
}
