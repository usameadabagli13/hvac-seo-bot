import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getValidToken } from "@/lib/gbp";

interface GBPLocation {
  name:  string; // e.g. "locations/12345"
  title: string;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const accessToken = await getValidToken(user.id);
  if (!accessToken) {
    return NextResponse.json(
      { error: "Google Business Profile not connected." },
      { status: 403 },
    );
  }

  const { data: integration } = await supabase
    .from("integrations")
    .select("account_name, location_name")
    .eq("user_id", user.id)
    .eq("provider", "google_business_profile")
    .maybeSingle();

  if (!integration?.account_name) {
    return NextResponse.json(
      { error: "GBP account not resolved. Reconnect to continue." },
      { status: 422 },
    );
  }

  // Fetch all locations under the account
  const locRes = await fetch(
    `https://mybusinessbusinessinformation.googleapis.com/v1/${integration.account_name}/locations?readMask=name,title&pageSize=100`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!locRes.ok) {
    const text = await locRes.text();
    console.error("[google/locations] GBP API error:", locRes.status, text);
    return NextResponse.json(
      { error: "Failed to fetch GBP locations." },
      { status: 502 },
    );
  }

  const data = await locRes.json() as { locations?: GBPLocation[] };
  const locations = (data.locations ?? []).map((l) => ({
    name:  `${integration.account_name}/${l.name}`, // full path stored in DB
    title: l.title ?? l.name,
  }));

  return NextResponse.json({
    locations,
    selected: integration.location_name ?? null,
  });
}
