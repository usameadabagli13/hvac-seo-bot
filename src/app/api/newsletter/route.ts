import type { NextRequest } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { sendEmail, newsletterWelcomeHtml } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body  = await request.json() as { email?: string };
    const email = body.email?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Invalid email." }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Detect first-time vs re-subscribe so we only send a welcome on the first signup
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("email, unsubscribed_at")
      .eq("email", email)
      .maybeSingle();

    const isNew = !existing;

    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert(
        {
          email,
          subscribed_at:   new Date().toISOString(),
          source:          "marketing_site",
          unsubscribed_at: null,
        },
        { onConflict: "email" }
      );

    if (error) {
      console.error("[newsletter] db error:", error);
      return Response.json({ ok: true });
    }

    // Send welcome email — only on first subscribe (or after unsubscribe + resubscribe)
    if (isNew || existing?.unsubscribed_at) {
      await sendEmail({
        to:      email,
        subject: "You're in — one HVAC SEO tip per week",
        html:    newsletterWelcomeHtml(),
        purpose: "newsletter",
      });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("[newsletter] unhandled:", err);
    return Response.json({ error: "Failed." }, { status: 500 });
  }
}
