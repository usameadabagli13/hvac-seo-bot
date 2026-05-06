import type { SupabaseClient } from "@supabase/supabase-js";

export interface OnboardingState {
  hasBusiness: boolean;
  hasGBP:      boolean;
  hasSnapshot: boolean;
  allDone:     boolean;
}

/**
 * Computes the user's activation progress: business added, GBP connected,
 * first real (non-mock) rank snapshot run. Used by the floating onboarding
 * tour in the app layout.
 */
export async function getOnboardingState(
  supabase: SupabaseClient,
  userId: string,
): Promise<OnboardingState> {
  const { data: businesses } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", userId)
    .is("deleted_at", null);

  const bizIds = (businesses ?? []).map((b) => b.id);

  const [{ data: gbp }, snapshotRes] = await Promise.all([
    supabase
      .from("integrations")
      .select("id")
      .eq("user_id", userId)
      .eq("provider", "google_business_profile")
      .maybeSingle(),
    bizIds.length > 0
      ? supabase
          .from("rank_snapshots")
          .select("id", { count: "exact", head: true })
          .in("business_id", bizIds)
          .eq("is_mock", false)
      : Promise.resolve({ count: 0 } as { count: number | null }),
  ]);

  const hasBusiness = bizIds.length > 0;
  const hasGBP      = !!gbp;
  const hasSnapshot = (snapshotRes.count ?? 0) > 0;

  return {
    hasBusiness,
    hasGBP,
    hasSnapshot,
    allDone: hasBusiness && hasGBP && hasSnapshot,
  };
}
