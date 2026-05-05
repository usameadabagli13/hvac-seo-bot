import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// ── Plan mapping: LemonSqueezy variant ID → internal plan name ───────────────
// Fill these in once you create products in your LemonSqueezy dashboard.
// Each price variant gets a unique variant_id.
const VARIANT_TO_PLAN: Record<string, "starter" | "pro" | "agency"> = {
  // Example — replace with your actual variant IDs:
  // "123456": "starter",
  // "123457": "pro",
  // "123458": "agency",
};

// ── Service-role client (bypasses RLS — server-only) ─────────────────────────
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ── Signature verification ────────────────────────────────────────────────────
function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[lemonsqueezy] LEMONSQUEEZY_WEBHOOK_SECRET not set");
    return false;
  }
  const hmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature));
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-signature") ?? "";
  const payload   = await request.text();

  if (!verifySignature(payload, signature)) {
    console.error("[lemonsqueezy] invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventName = (body.meta as Record<string, unknown>)?.event_name as string;
  const eventId   = (body.meta as Record<string, unknown>)?.webhook_id  as string;

  if (!eventId) {
    return NextResponse.json({ error: "Missing webhook_id" }, { status: 400 });
  }

  const supabase = getServiceClient();

  // ── Idempotency check ───────────────────────────────────────────────────────
  const { error: insertErr } = await supabase
    .from("lemon_events")
    .insert({ event_id: eventId, event_name: eventName });

  if (insertErr) {
    // Unique violation = already processed
    if (insertErr.code === "23505") {
      console.log("[lemonsqueezy] duplicate event, skipping:", eventId);
      return NextResponse.json({ ok: true, skipped: true });
    }
    console.error("[lemonsqueezy] idempotency insert error:", insertErr);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  // ── Parse subscription data ─────────────────────────────────────────────────
  const attrs = (body.data as Record<string, unknown>)?.attributes as Record<string, unknown> | undefined;
  if (!attrs) {
    return NextResponse.json({ ok: true }); // non-subscription event, ignore
  }

  const userEmail   = attrs.user_email   as string | undefined;
  const variantId   = String((attrs.variant_id as number | string) ?? "");
  const status      = attrs.status       as string | undefined; // "active" | "cancelled" | "expired" | "paused"

  // ── Resolve user by email ───────────────────────────────────────────────────
  if (!userEmail) {
    console.error("[lemonsqueezy] no user_email in event:", eventId);
    return NextResponse.json({ ok: true });
  }

  const { data: authUser } = await supabase.auth.admin.listUsers();
  const user = authUser?.users?.find((u) => u.email === userEmail);

  if (!user) {
    console.error("[lemonsqueezy] user not found for email:", userEmail);
    return NextResponse.json({ ok: true });
  }

  // ── Map variant → plan ──────────────────────────────────────────────────────
  const newPlan = VARIANT_TO_PLAN[variantId] ?? "starter";
  const isActive = status === "active";

  switch (eventName) {
    case "subscription_created":
    case "subscription_updated":
      await supabase
        .from("profiles")
        .update({ plan: isActive ? newPlan : "starter" })
        .eq("user_id", user.id);
      console.log(`[lemonsqueezy] ${eventName}: ${userEmail} → ${isActive ? newPlan : "starter"}`);
      break;

    case "subscription_cancelled":
    case "subscription_expired":
      await supabase
        .from("profiles")
        .update({ plan: "starter" })
        .eq("user_id", user.id);
      console.log(`[lemonsqueezy] ${eventName}: ${userEmail} → starter`);
      break;

    default:
      console.log("[lemonsqueezy] unhandled event:", eventName);
  }

  return NextResponse.json({ ok: true });
}
