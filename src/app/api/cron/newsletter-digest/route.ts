import type { NextRequest } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { sendEmail, newsletterTipHtml, type NewsletterTip } from "@/lib/email";
import { ARTICLES } from "@/data/articles";

/**
 * Weekly cron: emails every active newsletter subscriber a single HVAC SEO tip,
 * rotating through ARTICLES so each week ships a different one.
 *
 * Auth: Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` automatically.
 *
 * Schedule (vercel.json): "0 14 * * 1"  → Mondays 14:00 UTC = 9am ET / 6am PT.
 */

// ISO week number — used so each week deterministically picks the same article
function isoWeek(d: Date): number {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil((((t.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function pickThisWeeksTip(): NewsletterTip {
  const article = ARTICLES[isoWeek(new Date()) % ARTICLES.length];

  // Build a tip preview from the article: hook = first paragraph,
  // bullets = first list found, falling back to the first 3 paragraphs.
  const firstP = article.body.find((b) => b.type === "p")?.content as string | undefined;
  const firstUl = article.body.find((b) => b.type === "ul" || b.type === "ol")?.content as string[] | undefined;

  let bullets: string[];
  if (firstUl && firstUl.length >= 3) {
    bullets = firstUl.slice(0, 4);
  } else {
    bullets = article.body
      .filter((b) => b.type === "p")
      .slice(1, 4)
      .map((b) => b.content as string);
  }

  return {
    title:       article.title,
    category:    article.category,
    hook:        firstP ?? article.description,
    bullets,
    readMoreUrl: `https://www.heatrankai.com/resources/${article.slug}`,
  };
}

async function handle(request: NextRequest) {
  const expected = process.env.CRON_SECRET;
  const got      = request.headers.get("authorization");
  if (!expected || got !== `Bearer ${expected}`) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: subs, error: subErr } = await supabase
    .from("newsletter_subscribers")
    .select("email")
    .is("unsubscribed_at", null);

  if (subErr) {
    console.error("[cron/newsletter-digest] subscribers query failed:", subErr);
    return Response.json({ error: "Subscribers query failed." }, { status: 500 });
  }

  if (!subs || subs.length === 0) {
    return Response.json({ ok: true, sent: 0, total: 0 });
  }

  const tip = pickThisWeeksTip();

  let sent = 0;
  let fail = 0;

  // Lowercase, no emoji, no exclamation — looks like a personal email subject,
  // not a marketing blast. Helps Gmail Primary inbox classification.
  const subject = `quick tip: ${tip.title.toLowerCase().replace(/^the\s+/i, "")}`;

  for (const s of subs) {
    const ok = await sendEmail({
      to:      s.email,
      subject,
      html:    newsletterTipHtml(tip),
      purpose: "newsletter",
    });
    if (ok) sent++;
    else fail++;
  }

  console.log(`[cron/newsletter-digest] week=${isoWeek(new Date())} subject="${subject}" total=${subs.length} sent=${sent} failed=${fail}`);
  return Response.json({ ok: true, total: subs.length, sent, failed: fail, subject });
}

export async function GET(request: NextRequest)  { return handle(request); }
export async function POST(request: NextRequest) { return handle(request); }
