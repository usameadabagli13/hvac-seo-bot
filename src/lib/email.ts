import { Resend } from "resend";

let _resend: Resend | null = null;

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!_resend) _resend = new Resend(key);
  return _resend;
}

const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL ?? "HeatRank AI <support@heatrankai.com>";

interface SendArgs {
  to:      string;
  subject: string;
  html:    string;
}

/**
 * Sends an email via Resend. Returns true on success, false on any failure.
 * In dev (no RESEND_API_KEY) it logs to console and returns true so the
 * surrounding flow doesn't crash.
 */
export async function sendEmail({ to, subject, html }: SendArgs): Promise<boolean> {
  const client = getClient();
  if (!client) {
    console.log(`[email] (no RESEND_API_KEY) would have sent to=${to} subject="${subject}"`);
    return true;
  }

  try {
    const { data, error } = await client.emails.send({
      from:    FROM_ADDRESS,
      to,
      subject,
      html,
    });
    if (error) {
      console.error("[email] Resend error:", error);
      return false;
    }
    console.log(`[email] sent id=${data?.id} to=${to} subject="${subject}"`);
    return true;
  } catch (err) {
    console.error("[email] unexpected error:", err);
    return false;
  }
}

// ── Templates ─────────────────────────────────────────────────────────────────

export function waitlistWelcomeHtml(name: string | null): string {
  const greeting = name?.trim() ? `Hey ${name.trim().split(/\s+/)[0]},` : "Hey there,";
  return /* html */ `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: #18181b; line-height: 1.55;">
      <div style="padding: 32px 24px; background: #fafafa; border-radius: 16px;">
        <p style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #71717a; margin: 0 0 6px;">HeatRank AI</p>
        <h1 style="font-size: 22px; font-weight: 600; color: #18181b; margin: 0 0 12px;">You're on the list 🚀</h1>
        <p style="font-size: 15px; color: #3f3f46; margin: 0 0 14px;">${greeting}</p>
        <p style="font-size: 15px; color: #3f3f46; margin: 0 0 14px;">
          Thanks for joining the HeatRank AI waitlist. You'll be one of the first to know when we open new seats — and you'll get an extended trial when you do sign up.
        </p>
        <p style="font-size: 15px; color: #3f3f46; margin: 0 0 22px;">
          In the meantime, if you can't wait, the product is already live and you can start a free 14-day Pro trial today.
        </p>
        <a href="https://www.heatrankai.com/login"
           style="display: inline-block; padding: 12px 22px; background: #18181b; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 10px;">
          Skip the wait — start free
        </a>
      </div>
      <p style="font-size: 11px; color: #a1a1aa; text-align: center; margin: 14px 0 0;">
        HeatRank AI · Local SEO for HVAC contractors
      </p>
    </div>
  `;
}

export function trialEndingHtml(daysLeft: number): string {
  return /* html */ `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: #18181b; line-height: 1.55;">
      <div style="padding: 32px 24px; background: #fafafa; border-radius: 16px;">
        <p style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #71717a; margin: 0 0 6px;">HeatRank AI</p>
        <h1 style="font-size: 22px; font-weight: 600; color: #18181b; margin: 0 0 12px;">Your free trial ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"}</h1>
        <p style="font-size: 15px; color: #3f3f46; margin: 0 0 14px;">
          Quick heads up — your 14-day Pro trial is wrapping up soon. After that, your account drops to the Starter plan unless you upgrade.
        </p>
        <p style="font-size: 15px; color: #3f3f46; margin: 0 0 22px;">
          On Starter you keep your data, but AI replies, rank snapshots, and SEO audits get capped. Most HVAC owners on the trial said the rank heatmap alone paid for the upgrade in their first booked job.
        </p>
        <a href="https://www.heatrankai.com/settings?tab=billing"
           style="display: inline-block; padding: 12px 22px; background: #18181b; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 10px;">
          Keep Pro for $69/mo
        </a>
        <p style="font-size: 13px; color: #71717a; margin: 22px 0 0;">
          No surprise charges — you choose to upgrade. Reply to this email if you have questions or want a quick demo.
        </p>
      </div>
      <p style="font-size: 11px; color: #a1a1aa; text-align: center; margin: 14px 0 0;">
        HeatRank AI · Local SEO for HVAC contractors
      </p>
    </div>
  `;
}
