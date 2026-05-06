import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { sendEmail, waitlistWelcomeHtml, trialEndingHtml, type EmailPurpose } from "@/lib/email";
import { FOUNDING_COUPON_CODE } from "@/lib/founding";

/**
 * Admin-only: sends a real-template preview email to the caller's own
 * address. The `template` field controls which production HTML gets
 * rendered, the `purpose` field controls which Resend creds are used.
 *
 * Available templates:
 *   simple    — bare diagnostic ping
 *   founding  — actual welcome email a founding-member signup receives
 *   newsletter — actual welcome email after the founding spots are full
 *   trial     — actual day-12 trial-ending email
 */
type Template = "simple" | "founding" | "newsletter" | "trial";

export async function POST(request: NextRequest) {
  await requireAdmin();

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const email = session?.user?.email;
  if (!email) {
    return Response.json({ error: "No email on session." }, { status: 422 });
  }

  const body = await request.json().catch(() => ({})) as {
    purpose?:  EmailPurpose;
    template?: Template;
  };
  const purpose: EmailPurpose = body.purpose === "waitlist" ? "waitlist" : "trial";
  const template: Template   = body.template ?? "simple";

  let subject = `HeatRank test email (${purpose})`;
  let html: string;

  switch (template) {
    case "founding":
      subject = `[PREVIEW] You're a HeatRank AI founding member — ${FOUNDING_COUPON_CODE} locked in`;
      html    = waitlistWelcomeHtml(session?.user?.user_metadata?.full_name ?? "Friend", true);
      break;

    case "newsletter":
      subject = "[PREVIEW] You're on the HeatRank AI list";
      html    = waitlistWelcomeHtml(session?.user?.user_metadata?.full_name ?? "Friend", false);
      break;

    case "trial":
      subject = "[PREVIEW] Your HeatRank AI trial ends in 2 days";
      html    = trialEndingHtml(2);
      break;

    case "simple":
    default:
      subject = `HeatRank test email (${purpose})`;
      html    = `
        <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #18181b;">
          <h2 style="margin: 0 0 12px; font-size: 18px;">HeatRank email test</h2>
          <p style="margin: 0 0 8px; color: #3f3f46;">
            This is a test email from your <strong>${purpose}</strong> Resend credentials.
          </p>
          <p style="margin: 0 0 8px; color: #3f3f46;">
            If you got it, the API key + from address are wired correctly.
          </p>
          <p style="margin: 24px 0 0; font-size: 11px; color: #a1a1aa;">
            Sent ${new Date().toISOString()}
          </p>
        </div>
      `;
  }

  const ok = await sendEmail({ to: email, subject, html, purpose });

  return Response.json({
    ok,
    sentTo:   email,
    purpose,
    template,
    message:  ok
      ? "Resend accepted the request. Check your inbox (and spam folder)."
      : "Resend rejected the request. Look at Vercel logs for the exact error.",
  });
}
