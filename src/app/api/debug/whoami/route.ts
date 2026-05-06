import { createClient } from "@/utils/supabase/server";

/**
 * Read-only diagnostic endpoint. Returns the current session's user_id
 * and shows whether it matches the ADMIN_USER_ID env var. Use this when
 * /admin redirects you back to /dashboard unexpectedly.
 *
 * Safe to keep around — it only reveals the caller's own info.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return Response.json({ signedIn: false, message: "Not signed in." }, { status: 401 });
  }

  const sessionUserId = session.user.id;
  const sessionEmail  = session.user.email ?? null;
  const envAdminId    = process.env.ADMIN_USER_ID ?? null;

  // Only reveal a length-and-prefix preview of the env var so we can spot
  // typos without exposing it in full
  const envPreview = envAdminId
    ? `${envAdminId.slice(0, 8)}…${envAdminId.slice(-4)} (length ${envAdminId.length})`
    : "(not set)";

  const matches = !!envAdminId && envAdminId.trim() === sessionUserId;

  // Also pull the role from profiles so we know whether the SQL UPDATE worked
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", sessionUserId)
    .maybeSingle();

  return Response.json({
    signedIn:        true,
    sessionUserId,
    sessionEmail,
    sessionUserIdLength: sessionUserId.length,
    envAdminIdSet:   !!envAdminId,
    envAdminIdPreview: envPreview,
    matchesEnv:      matches,
    profileRole:     profile?.role ?? null,
    isAdminViaRole:  profile?.role === "admin",
    canAccessAdmin:  matches || profile?.role === "admin",
  });
}
