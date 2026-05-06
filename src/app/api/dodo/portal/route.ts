import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getDodoClient } from "@/lib/dodo";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.heatrankai.com";

/**
 * Returns a one-time URL to the Dodo Payments customer portal where the user
 * can manage their subscription (cancel, change plan, update card).
 *
 * Requires `profiles.dodo_customer_id` to be populated — webhook saves it on
 * subscription.active. If absent, returns 422 so the UI can prompt the user
 * to subscribe first.
 */
export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("dodo_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const customerId = profile?.dodo_customer_id as string | null | undefined;
  if (!customerId) {
    return NextResponse.json(
      {
        error:
          "No active subscription found. Subscribe to a plan first, then come back to manage it.",
      },
      { status: 422 },
    );
  }

  try {
    const dodo = getDodoClient();
    const session = await dodo.customers.customerPortal.create(customerId, {
      return_url: `${APP_URL}/settings?tab=billing`,
    });

    const url = (session as unknown as { link?: string; url?: string }).link
      ?? (session as unknown as { url?: string }).url;

    if (!url) {
      console.error("[dodo/portal] no URL on portal session response:", session);
      return NextResponse.json({ error: "Portal session creation failed." }, { status: 502 });
    }

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[dodo/portal] error:", err);
    return NextResponse.json({ error: "Couldn't open the customer portal. Please try again." }, { status: 500 });
  }
}
