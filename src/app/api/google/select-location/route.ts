import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json() as { location_name?: string };
  const locationName = body.location_name?.trim();

  if (!locationName || !locationName.startsWith("accounts/")) {
    return Response.json({ error: "Invalid location_name." }, { status: 400 });
  }

  const { error } = await supabase
    .from("integrations")
    .update({ location_name: locationName })
    .eq("user_id", user.id)
    .eq("provider", "google_business_profile");

  if (error) {
    console.error("[google/select-location] update failed:", error);
    return Response.json({ error: "Failed to switch location." }, { status: 500 });
  }

  console.log(`[google/select-location] switched to ${locationName} for user=${user.id}`);
  return Response.json({ ok: true });
}
