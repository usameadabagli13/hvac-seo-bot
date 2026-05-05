import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { getProductToPlan, type Plan } from "@/lib/dodo";

// Service-role client bypasses RLS — never expose to client
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function resolveUserId(
  supabase: ReturnType<typeof getServiceClient>,
  data: Record<string, unknown>
): Promise<string | null> {
  // Prefer metadata.user_id (set during checkout session creation)
  const metaUserId = (data.metadata as Record<string, string> | null)?.user_id;
  if (metaUserId) return metaUserId;

  // Fallback: look up by customer email
  const email =
    (data.customer as Record<string, string> | null)?.email ??
    (data.customer_email as string | undefined);

  if (!email) return null;

  const { data: authData } = await supabase.auth.admin.listUsers();
  return authData?.users?.find((u) => u.email === email)?.id ?? null;
}

function extractProductId(data: Record<string, unknown>): string | undefined {
  if (typeof data.product_id === "string") return data.product_id;
  const items = data.items as Array<{ product_id?: string }> | undefined;
  return items?.[0]?.product_id;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  // ── Signature verification (Standard Webhooks) ────────────────────────────
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[dodo/webhook] DODO_PAYMENTS_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Config error" }, { status: 500 });
  }

  let payload: Record<string, unknown>;
  try {
    const wh = new Webhook(secret);
    payload = wh.verify(rawBody, {
      "webhook-id":        request.headers.get("webhook-id")        ?? "",
      "webhook-signature": request.headers.get("webhook-signature") ?? "",
      "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
    }) as Record<string, unknown>;
  } catch (err) {
    console.error("[dodo/webhook] invalid signature:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const eventType = payload.type as string | undefined;
  // Dodo uses "webhook-id" header as the unique event identifier
  const eventId =
    request.headers.get("webhook-id") ??
    (payload.event_id as string | undefined) ??
    `${Date.now()}-${Math.random()}`;

  const data = payload.data as Record<string, unknown> | undefined;

  if (!eventType) {
    return NextResponse.json({ ok: true });
  }

  const supabase = getServiceClient();

  // ── Idempotency ───────────────────────────────────────────────────────────
  const { error: insertErr } = await supabase
    .from("dodo_events")
    .insert({ event_id: eventId, event_type: eventType });

  if (insertErr?.code === "23505") {
    console.log("[dodo/webhook] duplicate event skipped:", eventId);
    return NextResponse.json({ ok: true, skipped: true });
  }
  if (insertErr) {
    console.error("[dodo/webhook] idempotency insert failed:", insertErr);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  // Only subscription events change the user's plan
  if (!eventType.startsWith("subscription.") || !data) {
    console.log("[dodo/webhook] non-subscription event, ignoring:", eventType);
    return NextResponse.json({ ok: true });
  }

  // ── Resolve user ──────────────────────────────────────────────────────────
  const userId = await resolveUserId(supabase, data);
  if (!userId) {
    console.error("[dodo/webhook] could not resolve user for event:", eventId, data);
    return NextResponse.json({ ok: true });
  }

  // ── Map product → plan ────────────────────────────────────────────────────
  const productId = extractProductId(data);
  const productToPlan = getProductToPlan();
  const newPlan: Plan = (productId && productToPlan[productId]) ? productToPlan[productId] : "starter";

  // ── Update profiles.plan ──────────────────────────────────────────────────
  switch (eventType) {
    case "subscription.active":
    case "subscription.renewed":
    case "subscription.updated":
      // Paid → end the trial window so resolveTrialState() stops counting down.
      await supabase
        .from("profiles")
        .update({ plan: newPlan, trial_ends_at: null })
        .eq("user_id", userId);
      console.log(`[dodo/webhook] ${eventType}: user=${userId} plan=${newPlan} (trial cleared)`);
      break;

    case "subscription.cancelled":
    case "subscription.expired":
    case "subscription.failed":
    case "subscription.on_hold":
      await supabase
        .from("profiles")
        .update({ plan: "starter" })
        .eq("user_id", userId);
      console.log(`[dodo/webhook] ${eventType}: user=${userId} → reverted to starter`);
      break;

    default:
      console.log("[dodo/webhook] unhandled event type:", eventType);
  }

  return NextResponse.json({ ok: true });
}
