import { createClient } from "@/utils/supabase/server";
import { MOCK_SNAPSHOTS_ALL } from "@/lib/mock-rank-snapshots";

// Dev-only route — seeds mock 5×5 rank snapshots for the user's first business.
// POST /api/rank/seed-mock
export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return Response.json({ error: "Only available in development." }, { status: 403 });
  }

  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("id, business_name")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!business) {
    return Response.json(
      { error: "No businesses found. Add a business first." },
      { status: 422 }
    );
  }

  const rows = MOCK_SNAPSHOTS_ALL.map((s) => ({
    ...s,
    business_id: business.id,
  }));

  const { error: upsertError, count } = await supabase
    .from("rank_snapshots")
    .upsert(rows, {
      onConflict: "business_id,keyword,lat,lng,snapshot_date",
      ignoreDuplicates: false,
      count: "exact",
    });

  if (upsertError) {
    console.error("[rank/seed-mock] upsert error:", upsertError);
    return Response.json({ error: upsertError.message }, { status: 500 });
  }

  console.log(`[rank/seed-mock] seeded ${count} rank snapshot rows for "${business.business_name}"`);
  return Response.json({ seeded: count, business: business.business_name });
}
