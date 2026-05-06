import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

/**
 * Server-side guard for /admin routes. Verifies the current session belongs
 * to a profile with role='admin'. Redirects to /dashboard if not.
 *
 * Returns the userId on success so the caller can keep using it.
 */
export async function requireAdmin(): Promise<string> {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

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
