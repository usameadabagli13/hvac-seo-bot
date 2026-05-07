import { Resend } from "resend";
import {
  FOUNDING_COUPON_CODE,
  FOUNDING_COUPON_YEARLY,
  FOUNDING_COUPON_MONTHLY,
  FOUNDING_DISCOUNT,
  FOUNDING_DURATION_MONTHS,
  FOUNDING_DISPLAY_TOTAL,
} from "@/lib/founding";

/**
 * Email purpose drives which Resend credentials we use, so different flows
 * (transactional trial emails vs. marketing waitlist welcomes) can have
 * separate API keys + from addresses for audit/sender-reputation reasons.
 *
 * Each purpose checks its dedicated envs first, then falls back to the
 * generic RESEND_API_KEY / RESEND_FROM_EMAIL pair so a minimal single-key
 * setup still works for everything.
 */
export type EmailPurpose = "trial" | "waitlist" | "newsletter";

const PURPOSE_ENV: Record<EmailPurpose, { key: string; from: string }> = {
  trial:      { key: "RESEND_API_KEY",            from: "RESEND_FROM_EMAIL"            },
  waitlist:   { key: "RESEND_WAITLIST_API_KEY",   from: "RESEND_WAITLIST_FROM_EMAIL"   },
  newsletter: { key: "RESEND_NEWSLETTER_API_KEY", from: "RESEND_NEWSLETTER_FROM_EMAIL" },
};

const _clients = new Map<string, Resend>();

function resolveCreds(purpose: EmailPurpose): { client: Resend | null; from: string } {
  const cfg = PURPOSE_ENV[purpose];

  // Resolution order for the API key:
  //   1. The purpose-specific env  (e.g. RESEND_WAITLIST_API_KEY)
  //   2. The generic shared env    (RESEND_API_KEY)
  //   3. The waitlist env as a last-resort fallback (covers the case where
  //      one purpose has a working key but the other one was set up wrong)
  const apiKey = process.env[cfg.key]
              ?? process.env.RESEND_API_KEY
              ?? process.env.RESEND_WAITLIST_API_KEY
              ?? "";

  const from = process.env[cfg.from]
            ?? process.env.RESEND_FROM_EMAIL
            ?? process.env.RESEND_WAITLIST_FROM_EMAIL
            ?? "HeatRank AI <support@heatrankai.com>";

  if (!apiKey) return { client: null, from };
  let client = _clients.get(apiKey);
  if (!client) {
    client = new Resend(apiKey);
    _clients.set(apiKey, client);
  }
  return { client, from };
}

interface SendArgs {
  to:       string;
  subject:  string;
  html:     string;
  purpose?: EmailPurpose;
}

/**
 * Sends an email via Resend. Returns true on success, false on any failure.
 * In dev (no RESEND_API_KEY) it logs to console and returns true so the
 * surrounding flow doesn't crash.
 */
export async function sendEmail({ to, subject, html, purpose = "trial" }: SendArgs): Promise<boolean> {
  const { client, from } = resolveCreds(purpose);
  if (!client) {
    const cfg = PURPOSE_ENV[purpose];
    console.warn(
      `[email] No API key for purpose="${purpose}". Set ${cfg.key} (or fall back to RESEND_API_KEY). Skipping send to=${to} subject="${subject}".`,
    );
    return true;
  }

  try {
    const { data, error } = await client.emails.send({ from, to, subject, html });
    if (error) {
      console.error(`[email:${purpose}] Resend error:`, error);
      return false;
    }
    console.log(`[email:${purpose}] sent id=${data?.id} to=${to} subject="${subject}"`);
    return true;
  } catch (err) {
    console.error(`[email:${purpose}] unexpected error:`, err);
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
            You snagged one of the first ${FOUNDING_DISPLAY_TOTAL} founding-member spots. Here's what that gets you:
          </p>
          <ul style="font-size: 15px; color: #3f3f46; padding-left: 20px; margin: 0 0 22px;">
            <li><strong>${FOUNDING_DISCOUNT} off your first ${FOUNDING_DURATION_MONTHS} months</strong> — applied automatically every renewal during the period.</li>
            <li><strong>Permanent ★ Founder badge</strong> on your account, even after the discount window. Means priority support and early access to every new feature we ship.</li>
            <li>Direct line to the team — reply to this email and the founder reads it.</li>
          </ul>
          <div style="background: #fff7ed; border: 1px solid #fdba74; border-radius: 12px; padding: 16px 20px; margin: 0 0 22px;">
            <p style="font-size: 11px; letter-spacing: 0.10em; text-transform: uppercase; color: #b45309; margin: 0 0 8px;">Your founding codes</p>
            <table style="width: 100%; border-collapse: separate; border-spacing: 0;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #fed7aa;">
                  <p style="font-size: 11px; color: #92400e; margin: 0 0 2px; text-transform: uppercase; letter-spacing: 0.06em;">Yearly plan</p>
                  <p style="font-size: 18px; font-weight: 700; color: #18181b; margin: 0; font-family: ui-monospace, SFMono-Regular, monospace; letter-spacing: 0.04em;">${FOUNDING_COUPON_YEARLY}</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0;">
                  <p style="font-size: 11px; color: #92400e; margin: 0 0 2px; text-transform: uppercase; letter-spacing: 0.06em;">Monthly plan</p>
                  <p style="font-size: 18px; font-weight: 700; color: #18181b; margin: 0; font-family: ui-monospace, SFMono-Regular, monospace; letter-spacing: 0.04em;">${FOUNDING_COUPON_MONTHLY}</p>
                </td>
              </tr>
            </table>
            <p style="font-size: 12px; color: #78716c; margin: 10px 0 0;">Pick whichever billing cycle suits you and paste the matching code at checkout. Both lock in ${FOUNDING_DISCOUNT} off Pro for ${FOUNDING_DURATION_MONTHS} months. Your founder badge is permanent.</p>
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
          The ${FOUNDING_DISPLAY_TOTAL} founding-member spots are gone, but you're now on the HeatRank AI inside list. We'll send product updates, HVAC SEO playbooks, and the occasional case study — nothing else.
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

export function newsletterWelcomeHtml(): string {
  return /* html */ `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: #18181b; line-height: 1.55;">
      <div style="padding: 32px 24px; background: #fafafa; border-radius: 16px;">
        <p style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #b45309; margin: 0 0 6px;">HeatRank AI · Newsletter</p>
        <h1 style="font-size: 22px; font-weight: 600; color: #18181b; margin: 0 0 12px;">You&apos;re subscribed.</h1>
        <p style="font-size: 15px; color: #3f3f46; margin: 0 0 14px;">
          Every Monday morning you&apos;ll get one short, actionable HVAC SEO tip in your inbox — the kind that takes 10 minutes to apply but moves rankings over the year.
        </p>
        <p style="font-size: 15px; color: #3f3f46; margin: 0 0 22px;">
          Want to skip the wait? Here are three of our most-read playbooks:
        </p>
        <ul style="font-size: 14px; color: #3f3f46; padding-left: 20px; margin: 0 0 22px;">
          <li><a href="https://www.heatrankai.com/resources/google-business-profile-hvac-checklist" style="color: #b45309; text-decoration: underline;">12-Point Google Business Profile checklist</a></li>
          <li><a href="https://www.heatrankai.com/resources/hvac-keyword-strategy-2026" style="color: #b45309; text-decoration: underline;">HVAC keyword strategy that actually works in 2026</a></li>
          <li><a href="https://www.heatrankai.com/resources/negative-review-response-templates" style="color: #b45309; text-decoration: underline;">5 templates for replying to bad reviews</a></li>
        </ul>
        <a href="https://www.heatrankai.com/login"
           style="display: inline-block; padding: 12px 22px; background: #18181b; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 10px;">
          Try HeatRank AI free for 14 days
        </a>
        <p style="font-size: 12px; color: #71717a; margin: 22px 0 0;">
          Don&apos;t want these emails? Just reply with &ldquo;unsubscribe&rdquo; and you&apos;re out.
        </p>
      </div>
      <p style="font-size: 11px; color: #a1a1aa; text-align: center; margin: 14px 0 0;">
        HeatRank AI · Local SEO for HVAC contractors
      </p>
    </div>
  `;
}

export interface NewsletterTip {
  title:       string;
  category:    string;
  hook:        string;          // 1-2 sentence preview
  bullets:     string[];        // 3-4 quick takeaways
  readMoreUrl: string;
}

export function newsletterTipHtml(tip: NewsletterTip): string {
  const bulletsHtml = tip.bullets
    .map((b) => `<li style="margin-bottom: 8px;">${b}</li>`)
    .join("");

  return /* html */ `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #18181b; line-height: 1.55;">
      <div style="padding: 32px 24px; background: #fafafa; border-radius: 16px;">
        <p style="font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #b45309; font-weight: 600; margin: 0 0 6px;">
          ${tip.category} · HVAC SEO Tip
        </p>
        <h1 style="font-size: 24px; font-weight: 700; color: #18181b; margin: 0 0 14px; line-height: 1.25;">
          ${tip.title}
        </h1>
        <p style="font-size: 15px; color: #3f3f46; margin: 0 0 18px;">
          ${tip.hook}
        </p>
        <div style="background: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 18px 22px; margin: 0 0 22px;">
          <p style="font-size: 11px; color: #71717a; text-transform: uppercase; letter-spacing: 0.10em; margin: 0 0 10px; font-weight: 600;">Quick takeaways</p>
          <ul style="font-size: 14px; color: #3f3f46; padding-left: 18px; margin: 0;">
            ${bulletsHtml}
          </ul>
        </div>
        <a href="${tip.readMoreUrl}"
           style="display: inline-block; padding: 12px 22px; background: #18181b; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 10px;">
          Read the full guide →
        </a>
        <p style="font-size: 13px; color: #71717a; margin: 22px 0 0;">
          Want this automated? <a href="https://www.heatrankai.com/login" style="color: #b45309;">HeatRank AI</a> handles GBP, reviews, rank tracking, and SEO audits for $39/mo.
        </p>
      </div>
      <p style="font-size: 11px; color: #a1a1aa; text-align: center; margin: 14px 0 6px;">
        HeatRank AI · Local SEO for HVAC contractors
      </p>
      <p style="font-size: 11px; color: #a1a1aa; text-align: center; margin: 0;">
        Don&apos;t want these? <a href="mailto:support@heatrankai.com?subject=unsubscribe" style="color: #71717a;">Unsubscribe</a>
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
