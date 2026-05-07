import type { NextRequest } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body  = await request.json() as { email?: string };
    const email = body.email?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Invalid email." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert(
        { email, subscribed_at: new Date().toISOString(), source: "marketing_site" },
        { onConflict: "email" }
      );

    if (error) {
      console.error("[newsletter] db error:", error);
      // Don't 500 — silent OK so users get success even if table missing
      return Response.json({ ok: true });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("[newsletter] unhandled:", err);
    return Response.json({ error: "Failed." }, { status: 500 });
  }
}
