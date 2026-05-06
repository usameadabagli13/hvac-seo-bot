import { Resend } from "resend";
import { FOUNDING_COUPON_CODE, FOUNDING_DISCOUNT } from "@/lib/founding";

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

export function waitlistWelcomeHtml(name: string | null, isFounding: boolean): string {
  const greeting = name?.trim() ? `Hey ${name.trim().split(/\s+/)[0]},` : "Hey there,";

  if (isFounding) {
    return /* html */ `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: #18181b; line-height: 1.55;">
        <div style="padding: 32px 24px; background: #fafafa; border-radius: 16px;">
          <p style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #b45309; margin: 0 0 6px;">★ Founding Member</p>
          <h1 style="font-size: 22px; font-weight: 600; color: #18181b; margin: 0 0 12px;">Welcome aboard, ${greeting.replace(",", "")}.</h1>
          <p style="font-size: 15px; color: #3f3f46; margin: 0 0 14px;">
            You snagged one of the first 20 founding-member spots. Thanks for backing us this early — here's what that gets you:
          </p>
          <ul style="font-size: 15px; color: #3f3f46; padding-left: 20px; margin: 0 0 22px;">
            <li><strong>${FOUNDING_DISCOUNT} off forever</strong> — locked in for the lifetime of your account, even after public pricing goes up.</li>
            <li>Direct line to the team — reply to this email and the founder reads it.</li>
            <li>You'll vote on the next features we ship.</li>
          </ul>
          <div style="background: #fff7ed; border: 1px solid #fdba74; border-radius: 12px; padding: 16px 20px; margin: 0 0 22px;">
            <p style="font-size: 11px; letter-spacing: 0.10em; text-transform: uppercase; color: #b45309; margin: 0 0 4px;">Your founding code</p>
            <p style="font-size: 22px; font-weight: 700; color: #18181b; margin: 0; font-family: ui-monospace, SFMono-Regular, monospace; letter-spacing: 0.05em;">${FOUNDING_COUPON_CODE}</p>
            <p style="font-size: 12px; color: #78716c; margin: 6px 0 0;">Apply at checkout. ${FOUNDING_DISCOUNT} off your monthly or yearly Pro plan, every renewal.</p>
          </div>
          <a href="https://www.heatrankai.com/login"
             style="display: inline-block; padding: 12px 22px; background: #18181b; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 10px;">
            Start your free trial
          </a>
        </div>
        <p style="font-size: 11px; color: #a1a1aa; text-align: center; margin: 14px 0 0;">
          HeatRank AI · Local SEO for HVAC contractors
        </p>
      </div>
    `;
  }

  return /* html */ `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: #18181b; line-height: 1.55;">
      <div style="padding: 32px 24px; background: #fafafa; border-radius: 16px;">
        <p style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #71717a; margin: 0 0 6px;">HeatRank AI</p>
        <h1 style="font-size: 22px; font-weight: 600; color: #18181b; margin: 0 0 12px;">You're on the list</h1>
        <p style="font-size: 15px; color: #3f3f46; margin: 0 0 14px;">${greeting}</p>
        <p style="font-size: 15px; color: #3f3f46; margin: 0 0 14px;">
          The 20 founding-member spots are gone, but you're now on the HeatRank AI inside list. We'll send product updates, HVAC SEO playbooks, and the occasional case study — nothing else.
        </p>
        <p style="font-size: 15px; color: #3f3f46; margin: 0 0 22px;">
          You don't need to wait — the product is live and you can start a 14-day free Pro trial today.
        </p>
        <a href="https://www.heatrankai.com/login"
           style="display: inline-block; padding: 12px 22px; background: #18181b; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 10px;">
          Start free trial
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
