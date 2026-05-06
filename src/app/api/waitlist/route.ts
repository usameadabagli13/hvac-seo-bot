import type { NextRequest } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { sendEmail, waitlistWelcomeHtml } from "@/lib/email";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

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

  const { error } = await supabase.from("waitlist").insert({
    email,
    name:    name || null,
    company: company || null,
    source:  source || "landing",
  });

  if (error) {
    if (error.code === "23505") {
      // Duplicate — pretend success so the form doesn't leak which emails are signed up
      console.log(`[waitlist] duplicate join from ${email}`);
      return Response.json({ ok: true });
    }
    console.error("[waitlist] insert error:", error);
    return Response.json({ error: "Couldn't add you to the list. Please try again." }, { status: 500 });
  }

  // Fire-and-forget welcome (don't block the user on email delivery)
  sendEmail({
    to:      email,
    subject: "You're on the HeatRank AI waitlist",
    html:    waitlistWelcomeHtml(name || null),
  }).catch((err) => console.error("[waitlist] welcome email failed:", err));

  console.log(`[waitlist] new join: ${email}`);
  return Response.json({ ok: true });
}
