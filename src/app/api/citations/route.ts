import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET ?business_id=...
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const businessId = request.nextUrl.searchParams.get("business_id");
  if (!businessId) {
    return Response.json({ error: "business_id is required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("citations")
    .select("id, directory, listing_url, detected_name, detected_address, detected_phone, nap_consistent, diff, last_checked_at")
    .eq("business_id", businessId)
    .order("last_checked_at", { ascending: false });

  if (error) {
    console.error("[citations] list error:", error);
    return Response.json({ error: "Failed to load citations." }, { status: 500 });
  }

  return Response.json({ citations: data ?? [] });
}

// DELETE ?id=...
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return Response.json({ error: "id is required." }, { status: 400 });
  }

  const { error } = await supabase.from("citations").delete().eq("id", id);
  // RLS will silently ignore deletes for citations the user doesn't own; that's fine here.

  if (error) {
    console.error("[citations] delete error:", error);
    return Response.json({ error: "Failed to delete." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
