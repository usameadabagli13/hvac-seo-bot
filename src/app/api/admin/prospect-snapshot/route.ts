import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/utils/supabase/admin";

const PLACES_KEY   = process.env.GOOGLE_PLACES_API_KEY;
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const APP_URL      = process.env.NEXT_PUBLIC_APP_URL ?? "https://heatrankai.com";

const GRID_SIZE   = 5;
const LAT_SPACING = 0.0145;

function generateGrid(centerLat: number, centerLng: number) {
  const half       = Math.floor(GRID_SIZE / 2);
  const lngSpacing = LAT_SPACING / Math.cos((centerLat * Math.PI) / 180);
  const points: { lat: number; lng: number }[] = [];
  for (let row = -half; row <= half; row++) {
    for (let col = -half; col <= half; col++) {
      points.push({
        lat: +((centerLat + row * LAT_SPACING).toFixed(7)),
        lng: +((centerLng + col * lngSpacing).toFixed(7)),
      });
    }
  }
  return points;
}

async function geocode(city: string): Promise<{ lat: number; lng: number } | null> {
  if (!MAPBOX_TOKEN) return null;
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(city)}.json?limit=1&types=place,district,region&access_token=${MAPBOX_TOKEN}`
    );
    if (!res.ok) return null;
    const data = await res.json() as { features?: { center: [number, number] }[] };
    const center = data.features?.[0]?.center;
    return center ? { lat: center[1], lng: center[0] } : null;
  } catch { return null; }
}

async function resolveGooglePlaceId(businessName: string, lat: number, lng: number): Promise<string | null> {
  if (!PLACES_KEY) return null;
  try {
    const params = new URLSearchParams({
      input:        businessName,
      inputtype:    "textquery",
      fields:       "place_id",
      locationbias: `circle:15000@${lat},${lng}`,
      key:          PLACES_KEY,
    });
    const res  = await fetch(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?${params}`);
    if (!res.ok) return null;
    const data = await res.json() as { candidates?: { place_id: string }[] };
    return data.candidates?.[0]?.place_id ?? null;
  } catch { return null; }
}

async function getRankAtPoint(keyword: string, lat: number, lng: number, placeId: string): Promise<number | null> {
  if (!PLACES_KEY) return null;
  try {
    const params = new URLSearchParams({
      query:    keyword,
      location: `${lat},${lng}`,
      radius:   "5000",
      key:      PLACES_KEY,
    });
    const res  = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`);
    if (!res.ok) return null;
    const data = await res.json() as { results?: { place_id: string }[] };
    const idx  = (data.results ?? []).findIndex((r) => r.place_id === placeId);
    return idx === -1 ? null : idx + 1;
  } catch { return null; }
}

function randomToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function POST(request: NextRequest) {
  await requireAdmin();

  if (!PLACES_KEY) {
    return Response.json({ error: "GOOGLE_PLACES_API_KEY not configured." }, { status: 500 });
  }

  const body = await request.json() as {
    business_name?: string;
    city?:          string;
    keyword?:       string;
  };

  const businessName = body.business_name?.trim();
  const city         = body.city?.trim();
  const keyword      = body.keyword?.trim();

  if (!businessName || !city || !keyword) {
    return Response.json({ error: "business_name, city, and keyword are required." }, { status: 400 });
  }

  // 1. Geocode city
  const center = await geocode(city);
  if (!center) {
    return Response.json(
      { error: `Could not geocode "${city}". Try format: "Dallas, TX"` },
      { status: 422 },
    );
  }

  // 2. Resolve Google Place ID
  const placeId = await resolveGooglePlaceId(businessName, center.lat, center.lng);
  if (!placeId) {
    return Response.json(
      { error: `Could not find "${businessName}" on Google Maps near ${city}. Try the exact name as shown on their Google listing.` },
      { status: 422 },
    );
  }

  // 3. Scan 25 grid points in parallel
  const gridPoints = generateGrid(center.lat, center.lng);
  const points = await Promise.all(
    gridPoints.map(async (pt) => ({
      lat:           pt.lat,
      lng:           pt.lng,
      rank_position: await getRankAtPoint(keyword, pt.lat, pt.lng, placeId),
    }))
  );

  // 4. Save to DB via service role (bypasses RLS)
  const token    = randomToken();
  const supabase = createAdminClient();

  const { error: dbError } = await supabase
    .from("prospect_snapshots")
    .insert({
      token,
      business_name: businessName,
      city,
      keyword,
      center_lat: center.lat,
      center_lng: center.lng,
      points,
    });

  if (dbError) {
    console.error("[admin/prospect-snapshot] db error:", dbError);
    return Response.json({ error: dbError.message }, { status: 500 });
  }

  const ranked   = points.filter((p) => p.rank_position !== null).length;
  const shareUrl = `${APP_URL}/share/${token}`;

  console.log(`[admin/prospect-snapshot] ${businessName} (${city}) — ${ranked}/25 ranked — token: ${token}`);
  return Response.json({ token, shareUrl, ranked, total: points.length });
}
