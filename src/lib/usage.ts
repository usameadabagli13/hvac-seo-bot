import { createClient } from "@/utils/supabase/server";

// Monthly limits per feature for the Starter tier.
// Phase 6 extension point: swap this lookup for a plan query against
// the profiles table (profiles.plan) once paid plans are gated.
const FREE_LIMITS: Record<string, number> = {
  keyword_generation: 1,
  review_reply: 3,
};

function getPeriodStart(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export async function checkUsageAllowed(
  userId: string,
  feature: string
): Promise<boolean> {
  // Bypass all limits in development so testing never gets blocked
  if (process.env.NODE_ENV === "development") return true;

  const limit = FREE_LIMITS[feature];
  if (limit === undefined) return true; // unknown feature = no cap yet

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_usage")
    .select("count")
    .eq("user_id", userId)
    .eq("feature", feature)
    .eq("period_start", getPeriodStart())
    .maybeSingle();

  if (error) {
    console.error("[usage] checkUsageAllowed error:", error);
    return false; // fail closed — don't let unknown DB errors bypass the gate
  }

  return (data?.count ?? 0) < limit;
}

export async function incrementUsage(
  userId: string,
  feature: string
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("increment_ai_usage", {
    p_user_id: userId,
    p_feature: feature,
    p_period_start: getPeriodStart(),
  });

  if (error) {
    console.error("[usage] incrementUsage error:", error);
  }
}
