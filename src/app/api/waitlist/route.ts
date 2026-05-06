import type { NextRequest } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { sendEmail, waitlistWelcomeHtml } from "@/lib/email";
import { FOUNDING_TOTAL_SPOTS, FOUNDING_COUPON_CODE } from "@/lib/founding";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// GET — current founding-spot status, used by the landing page form
export async function GET() {
  const supabase = createAdminClient();
  const { count } = await supabase
    .from("waitlist")
    .select("id", { count: "exact", head: true })
    .eq("is_founding", true);
  const claimed = count ?? 0;
  return Response.json({
    total:     FOUNDING_TOTAL_SPOTS,
    claimed,
    remaining: Math.max(0, FOUNDING_TOTAL_SPOTS - claimed),
  });
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email   = typeof body.email   === "string" ? body.email.trim().toLowerCase() : "";
  const name    = typeof body.name    === "string" ? body.name.trim() : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";
  const source  = typeof body.source  === "string" ? body.source.trim() : "landing";

  if (!email || !EMAIL_RE.test(email)) {
    return Response.json({ error: "Please enter a valid email." }, { status: 422 });
  }

  // Service-role client because the waitlist table's INSERT policy is open
  // to anon, but we want to swallow duplicate-key errors cleanly.
  const supabase = createAdminClient();

  // Are there founding spots left?
  const { count: foundingClaimed } = await supabase
    .from("waitlist")
    .select("id", { count: "exact", head: true })
    .eq("is_founding", true);
  const isFounding = (foundingClaimed ?? 0) < FOUNDING_TOTAL_SPOTS;
  const couponCode = isFounding ? FOUNDING_COUPON_CODE : null;

  const { error } = await supabase.from("waitlist").insert({
    email,
    name:        name || null,
    company:     company || null,
    source:      source || "landing",
    is_founding: isFounding,
    coupon_code: couponCode,
  });

  if (error) {
    if (error.code === "23505") {
      // Duplicate — pretend success so the form doesn't leak which emails are signed up
      console.log(`[waitlist] duplicate join from ${email}`);
      return Response.json({ ok: true, founding: false });
    }
    console.error("[waitlist] insert error:", error);
    return Response.json({ error: "Couldn't add you to the list. Please try again." }, { status: 500 });
  }

  // Fire-and-forget welcome (don't block the user on email delivery)
  sendEmail({
    to:      email,
    subject: isFounding
      ? `You're a HeatRank AI founding member — ${FOUNDING_COUPON_CODE} locked in`
      : "You're on the HeatRank AI list",
    html:    waitlistWelcomeHtml(name || null, isFounding),
  }).catch((err) => console.error("[waitlist] welcome email failed:", err));

  console.log(`[waitlist] new join: ${email} founding=${isFounding}`);
  return Response.json({ ok: true, founding: isFounding });
}
