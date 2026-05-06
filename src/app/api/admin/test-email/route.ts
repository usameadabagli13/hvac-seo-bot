import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { sendEmail, type EmailPurpose } from "@/lib/email";

/**
 * Admin-only: sends a one-line test email to the caller's own address
 * via the requested Resend purpose ('trial' or 'waitlist'). Lets the
 * founder verify each Resend credential pair end-to-end without
 * touching real users.
 */
export async function POST(request: NextRequest) {
  await requireAdmin();

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const email = session?.user?.email;
  if (!email) {
    return Response.json({ error: "No email on session." }, { status: 422 });
  }

  const body = await request.json().catch(() => ({})) as { purpose?: EmailPurpose };
  const purpose: EmailPurpose = body.purpose === "waitlist" ? "waitlist" : "trial";

  const ok = await sendEmail({
    to:      email,
    subject: `HeatRank test email (${purpose})`,
    purpose,
    html: `
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
    `,
  });

  return Response.json({
    ok,
    sentTo:   email,
    purpose,
    message:  ok
      ? "Resend accepted the request. Check your inbox (and spam folder)."
      : "Resend rejected the request. Look at Vercel logs for the exact error.",
  });
}
