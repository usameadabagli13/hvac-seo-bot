import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

const PLACES_KEY = process.env.GOOGLE_PLACES_API_KEY;

const FREE_LIMIT  = 0; // Starter: no competitor tracking
const PRO_LIMIT   = 3;
const AGENCY_LIMIT = 10;

interface FindPlaceResult {
  candidates?: Array<{ place_id?: string; name?: string }>;
}

interface PlaceDetailsResult {
  result?: {
    name?:                string;
    rating?:              number;
    user_ratings_total?:  number;
    place_id?:            string;
  };
  status?: string;
}

async function findPlaceId(query: string, lat?: number, lng?: number): Promise<{ place_id: string; name: string } | null> {
  if (!PLACES_KEY) return null;
  const params = new URLSearchParams({
    input:     query,
    inputtype: "textquery",
    fields:    "place_id,name",
    key:       PLACES_KEY,
  });
  if (lat != null && lng != null) params.set("locationbias", `circle:20000@${lat},${lng}`);

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?${params}`,
    );
    if (!res.ok) return null;
    const data = await res.json() as FindPlaceResult;
    const cand = data.candidates?.[0];
    if (!cand?.place_id) return null;
    return { place_id: cand.place_id, name: cand.name ?? "(unknown)" };
  } catch {
    return null;
  }
}

async function fetchPlaceDetails(placeId: string): Promise<PlaceDetailsResult["result"] | null> {
  if (!PLACES_KEY) return null;
  const params = new URLSearchParams({
    place_id: placeId,
    fields:   "name,rating,user_ratings_total",
    key:      PLACES_KEY,
  });
  try {
    const res = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${params}`);
    if (!res.ok) return null;
    const data = await res.json() as PlaceDetailsResult;
    return data.result ?? null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const businessId = request.nextUrl.searchParams.get("business_id");
  if (!businessId) return Response.json({ error: "business_id is required." }, { status: 400 });

  const { data, error } = await supabase
    .from("competitors")
    .select("id, name, place_id, avg_rating, review_count, last_fetched_at, created_at")
    .eq("business_id", businessId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[competitors] list error:", error);
    return Response.json({ error: "Failed to load competitors." }, { status: 500 });
  }

  return Response.json({ competitors: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!PLACES_KEY) {
    return Response.json({ error: "Google Places API key is not configured." }, { status: 500 });
  }

  const body = await request.json() as { business_id?: string; query?: string };
  const businessId = body.business_id;
  const query      = body.query?.trim();

  if (!businessId || !query) {
    return Response.json({ error: "business_id and query are required." }, { status: 400 });
  }

  // Plan-based competitor cap
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("user_id", user.id)
    .maybeSingle();
  const plan = (profile?.plan as "starter" | "pro" | "agency") ?? "starter";
  const cap  = plan === "agency" ? AGENCY_LIMIT : plan === "pro" ? PRO_LIMIT : FREE_LIMIT;
  if (cap === 0) {
    return Response.json(
      { error: "Competitor tracking is a Pro feature. Upgrade to track up to 3 competitors." },
      { status: 403 },
    );
  }

  // Ownership check + grab service location for biased Find Place
  const { data: biz } = await supabase
    .from("businesses")
    .select("id, service_location")
    .eq("id", businessId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!biz) return Response.json({ error: "Business not found." }, { status: 404 });

  // Existing count
  const { count } = await supabase
    .from("competitors")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId);
  if ((count ?? 0) >= cap) {
    return Response.json(
      { error: `Plan limit reached (${cap} competitors). Upgrade or remove one to add more.` },
      { status: 429 },
    );
  }

  // Geocode service_location → bias Find Place
  let lat: number | undefined;
  let lng: number | undefined;
  if (process.env.NEXT_PUBLIC_MAPBOX_TOKEN && biz.service_location) {
    try {
      const geo = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(biz.service_location)}.json?limit=1&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`,
      );
      if (geo.ok) {
        const g = await geo.json() as { features?: { center: [number, number] }[] };
        const c = g.features?.[0]?.center;
        if (c) { lng = c[0]; lat = c[1]; }
      }
    } catch {}
  }

  const found = await findPlaceId(query, lat, lng);
  if (!found) {
    return Response.json(
      { error: "Couldn't find that business on Google Maps. Try a more specific query." },
      { status: 422 },
    );
  }

  const details = await fetchPlaceDetails(found.place_id);

  const { data, error } = await supabase
    .from("competitors")
    .insert({
      business_id:     businessId,
      name:            details?.name ?? found.name,
      place_id:        found.place_id,
      avg_rating:      details?.rating ?? null,
      review_count:    details?.user_ratings_total ?? null,
      last_fetched_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return Response.json({ error: "That competitor is already tracked." }, { status: 409 });
    }
    console.error("[competitors] insert error:", error);
    return Response.json({ error: "Failed to add competitor." }, { status: 500 });
  }

  return Response.json({ ok: true, id: data.id });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return Response.json({ error: "id is required." }, { status: 400 });

  const { error } = await supabase.from("competitors").delete().eq("id", id);
  if (error) {
    console.error("[competitors] delete error:", error);
    return Response.json({ error: "Failed to remove." }, { status: 500 });
  }
  return Response.json({ ok: true });
}
