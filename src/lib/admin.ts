import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

/**
 * Server-side guard for /admin routes.
 *
 * Two ways to qualify:
 *   1. The session user id matches the ADMIN_USER_ID env var (founder
 *      shortcut — no DB role needed, no migration dependency).
 *   2. profiles.role = 'admin' for the session user.
 *
 * Redirects to /dashboard if neither holds. Returns the userId on success.
 */
export async function requireAdmin(): Promise<string> {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  // Founder shortcut: single env-defined user is always admin
  const envAdminId = process.env.ADMIN_USER_ID?.trim();
  if (envAdminId && envAdminId === session.user.id) {
    return session.user.id;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return session.user.id;
}
