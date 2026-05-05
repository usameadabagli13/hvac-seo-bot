import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getDodoClient, getPlanProducts, type Plan, type BillingInterval } from "@/lib/dodo";

export async function POST(request: NextRequest) {
  // Verify session
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse request body
  let plan: Plan, interval: BillingInterval;
  try {
    ({ plan, interval } = await request.json() as { plan: Plan; interval: BillingInterval });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const productId = getPlanProducts()[plan]?.[interval];
  if (!productId) {
    return NextResponse.json({ error: "Unknown plan or interval" }, { status: 400 });
  }

  // Fetch display name for the checkout page
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("user_id", user.id)
    .maybeSingle();

  try {
    const dodo = getDodoClient();
    const session = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: {
        email: user.email!,
        name: profile?.full_name || user.email!,
      },
      // user_id in metadata lets the webhook skip the email lookup
      metadata: { user_id: user.id },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=billing&status=success`,
    } as Parameters<typeof dodo.checkoutSessions.create>[0]);

    const url = (session as { checkout_url?: string; url?: string }).checkout_url
      ?? (session as { checkout_url?: string; url?: string }).url;

    if (!url) {
      console.error("[dodo] checkout session missing URL:", session);
      return NextResponse.json({ error: "No checkout URL returned" }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[dodo] checkout session error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
