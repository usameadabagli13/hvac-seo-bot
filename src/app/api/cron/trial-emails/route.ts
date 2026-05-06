import type { NextRequest } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { sendEmail, trialEndingHtml } from "@/lib/email";

/**
 * Daily cron: emails users whose 14-day Pro trial ends in the next ~2 days
 * (so a signup on day 12 gets the heads-up). Idempotent via
 * `profiles.trial_email_sent_at` — once set, the user is skipped on
 * subsequent runs.
 *
 * Auth: Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` automatically.
 * Manual trigger: same header.
 */
async function handle(request: NextRequest) {
  const expected = process.env.CRON_SECRET;
  const got = request.headers.get("authorization");
  if (!expected || got !== `Bearer ${expected}`) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Window: trial ends between ~24h from now and ~48h from now
  const windowStart = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const windowEnd   = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  const { data: profiles, error: profErr } = await supabase
    .from("profiles")
    .select("user_id, trial_ends_at")
    .gte("trial_ends_at", windowStart)
    .lte("trial_ends_at", windowEnd)
    .is("trial_email_sent_at", null);

  if (profErr) {
    console.error("[cron/trial-emails] profile query failed:", profErr);
    return Response.json({ error: "Profile query failed." }, { status: 500 });
  }

  if (!profiles || profiles.length === 0) {
    return Response.json({ ok: true, sent: 0, scanned: 0 });
  }

  // Look up emails from auth.users via the admin API
  let sent  = 0;
  let fails = 0;

  for (const p of profiles) {
    const { data: userData, error: userErr } = await supabase.auth.admin.getUserById(p.user_id);
    if (userErr || !userData.user?.email) {
      console.error(`[cron/trial-emails] no email for user=${p.user_id}`, userErr);
      fails++;
      continue;
    }

    const trialEnd = new Date(p.trial_ends_at);
    const daysLeft = Math.max(1, Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    const ok = await sendEmail({
      to:      userData.user.email,
      subject: `Your HeatRank AI trial ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
      html:    trialEndingHtml(daysLeft),
    });

    if (!ok) {
      fails++;
      continue;
    }

    // Mark sent so we never email the same user twice
    await supabase
      .from("profiles")
      .update({ trial_email_sent_at: new Date().toISOString() })
      .eq("user_id", p.user_id);

    sent++;
  }

  console.log(`[cron/trial-emails] scanned=${profiles.length} sent=${sent} failed=${fails}`);
  return Response.json({ ok: true, scanned: profiles.length, sent, failed: fails });
}

export async function GET(request: NextRequest) { return handle(request); }
export async function POST(request: NextRequest) { return handle(request); }
