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

// Deliverability note: kept lightweight on purpose — no buttons, no card
// backgrounds, no big graphics. Gmail's Promotions filter heavily weights
// design density. A near-plain-text HTML email lands in Primary far more often.
// We do allow: a small header line, a thin divider, a sign-off, and a footer —
// just enough to feel branded without screaming "marketing".
export function newsletterWelcomeHtml(): string {
  return /* html */ `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a; line-height: 1.6; font-size: 15px;">
      <p style="font-size: 12px; color: #888; margin: 0 0 4px;">HeatRank AI</p>
      <h2 style="font-size: 18px; font-weight: 600; color: #1a1a1a; margin: 0 0 20px;">Thanks for signing up</h2>

      <p>Hey,</p>

      <p>I&apos;m Mike, one of the folks behind HeatRank AI. We help HVAC contractors rank higher on Google without paying agency rates.</p>

      <p>Every Monday I&apos;ll send you one short tip you can actually apply that week. No fluff, no &ldquo;5 reasons SEO is important&rdquo; filler.</p>

      <p>While you wait, here&apos;s the piece I&apos;d start with:</p>

      <p style="margin-left: 16px;">→ <a href="https://www.heatrankai.com/resources/google-business-profile-hvac-checklist" style="color: #1a1a1a; font-weight: 500;">The 12-point Google Business Profile checklist for HVAC contractors</a></p>

      <p>If anything&apos;s ever off, just hit reply — I read every email myself.</p>

      <p style="margin-top: 24px;">— Mike<br/>
        <span style="color: #888; font-size: 14px;">HeatRank AI</span>
      </p>

      <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0 16px;" />

      <p style="color: #888; font-size: 12px; margin: 0;">
        Don&apos;t want these? Reply with &ldquo;unsubscribe&rdquo; and I&apos;ll take you off.
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

// Plain-text-style HTML for Primary inbox delivery, with a tiny bit of
// structure (header label, divider) so it doesn't feel naked.
export function newsletterTipHtml(tip: NewsletterTip): string {
  const bulletsHtml = tip.bullets
    .map((b) => `<li style="margin-bottom: 6px;">${b}</li>`)
    .join("");

  return /* html */ `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a; line-height: 1.6; font-size: 15px;">
      <p style="font-size: 12px; color: #888; margin: 0 0 4px;">HeatRank AI · ${tip.category}</p>
      <h2 style="font-size: 18px; font-weight: 600; color: #1a1a1a; margin: 0 0 20px;">${tip.title}</h2>

      <p>Hey,</p>

      <p>${tip.hook}</p>

      <p>Three things to do this week:</p>

      <ul style="padding-left: 20px; margin: 0 0 16px;">
        ${bulletsHtml}
      </ul>

      <p>Full write-up if you want to go deeper:<br/>
        <span style="margin-left: 16px;">→ <a href="${tip.readMoreUrl}" style="color: #1a1a1a; font-weight: 500;">${tip.readMoreUrl}</a></span>
      </p>

      <p>Reply if you have questions — I read every email myself.</p>

      <p style="margin-top: 24px;">— Mike<br/>
        <span style="color: #888; font-size: 14px;">HeatRank AI</span>
      </p>

      <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0 16px;" />

      <p style="color: #888; font-size: 12px; margin: 0;">
        Don&apos;t want these? Reply &ldquo;unsubscribe&rdquo; and I&apos;ll take you off.
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
