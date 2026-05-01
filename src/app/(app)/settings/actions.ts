"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function deleteAccount() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Delete user-owned data first (explicit, doesn't rely on DB cascade)
  await supabase.from("ai_usage").delete().eq("user_id", user.id);
  await supabase.from("businesses").delete().eq("user_id", user.id);

  // Sign the session out before deleting the auth record
  await supabase.auth.signOut();

  // Delete the auth user via admin client (requires SUPABASE_SERVICE_ROLE_KEY)
  const admin = createAdminClient();
  await admin.auth.admin.deleteUser(user.id);

  redirect("/");
}
