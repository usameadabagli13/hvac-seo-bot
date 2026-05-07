import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { checkUsageAllowed, incrementUsage } from "@/lib/usage";

const PLACES_KEY  = process.env.GOOGLE_PLACES_API_KEY;
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const GRID_SIZE   = 5;
const LAT_SPACING = 0.0145; // ~1 mile per step

// ── Grid generation ───────────────────────────────────────────────────────────

function generateGrid(centerLat: number, centerLng: number) {
  const half = Math.floor(GRID_SIZE / 2);
  // Correct longitude spacing for the latitude (1° lng shrinks toward the poles)
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

// ── Geocoding (Mapbox) ────────────────────────────────────────────────────────

async function geocode(location: string): Promise<{ lat: number; lng: number } | null> {
  if (!MAPBOX_TOKEN) return null;
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?limit=1&types=place,district,region&access_token=${MAPBOX_TOKEN}`
    );
    if (!res.ok) return null;
    const data = await res.json() as { features?: { center: [number, number] }[] };
    const center = data.features?.[0]?.center;
    if (!center) return null;
    return { lat: center[1], lng: center[0] };
  } catch {
    return null;
  }
}

// ── Google Places helpers ─────────────────────────────────────────────────────

// Find the Google Place ID for the business by name + rough location.
// Returns null if not found.
async function resolveGooglePlaceId(
  businessName: string,
  lat: number,
  lng: number
): Promise<string | null> {
  if (!PLACES_KEY) return null;
  try {
    const params = new URLSearchParams({
      input:        businessName,
      inputtype:    "textquery",
      fields:       "place_id",
      locationbias: `circle:10000@${lat},${lng}`,
      key:          PLACES_KEY,
    });
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?${params}`
    );
    if (!res.ok) return null;
    const data = await res.json() as { candidates?: { place_id: string }[] };
    return data.candidates?.[0]?.place_id ?? null;
  } catch {
    return null;
  }
}

// Search for a keyword near a grid point and return the rank of our business.
// Returns null if not found in the first page of results (top 20).
async function getRankAtPoint(
  keyword: string,
  lat: number,
  lng: number,
  placeId: string
): Promise<number | null> {
  if (!PLACES_KEY) return null;
  try {
    const params = new URLSearchParams({
      query:    keyword,
      location: `${lat},${lng}`,
      radius:   "5000",
      key:      PLACES_KEY,
    });
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`
    );
    if (!res.ok) return null;
    const data = await res.json() as { results?: { place_id: string }[] };
    const idx = (data.results ?? []).findIndex((r) => r.place_id === placeId);
    return idx === -1 ? null : idx + 1;
  } catch {
    return null;
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!PLACES_KEY) {
    return Response.json(
      { error: "Google Places API key is not configured on the server." },
      { status: 500 }
    );
  }

  const body = await request.json() as { business_id?: string; keyword?: string };
  const { business_id, keyword } = body;

  if (!business_id || !keyword?.trim()) {
    return Response.json({ error: "business_id and keyword are required." }, { status: 400 });
  }

  // GBP connection gate — without GBP we can't reliably identify the user's
  // listing, so the snapshot would burn a credit on a guess.
  const { data: gbpIntegration } = await supabase
    .from("integrations")
    .select("id, location_name")
    .eq("user_id", user.id)
    .eq("provider", "google_business_profile")
    .maybeSingle();

  if (!gbpIntegration?.location_name) {
    return Response.json(
      {
        error:
          "Connect your Google Business Profile first. Without it we can't reliably identify your listing on Google Maps, so we won't burn a snapshot credit on a guess.",
        code: "GBP_NOT_CONNECTED",
      },
      { status: 422 }
    );
  }

  // Ownership check
  const { data: biz } = await supabase
    .from("businesses")
    .select("id, business_name, service_location, google_place_id")
    .eq("id", business_id)
    .eq("user_id", user.id)
    .single();

  if (!biz) {
    return Response.json({ error: "Business not found." }, { status: 404 });
  }

  // Usage gate
  const allowed = await checkUsageAllowed(user.id, "rank_snapshot");
  if (!allowed) {
    return Response.json(
      { error: "Monthly rank snapshot limit reached. Upgrade to Pro for unlimited snapshots." },
      { status: 429 }
    );
  }

  // Geocode service location → grid center
  const center = await geocode(biz.service_location);
  if (!center) {
    return Response.json(
      { error: "Could not geocode your service location. Update it in Business Settings." },
      { status: 422 }
    );
  }

  // Resolve (and cache) the Google Place ID for this business
  let placeId = (biz.google_place_id as string | null) ?? null;
  if (!placeId) {
    placeId = await resolveGooglePlaceId(biz.business_name, center.lat, center.lng);
    if (placeId) {
      await supabase
        .from("businesses")
        .update({ google_place_id: placeId })
        .eq("id", business_id);
    }
  }

  if (!placeId) {
    return Response.json(
      {
        error:
          "Could not find your business on Google Maps. Make sure the business name in HeatRank matches your Google Business Profile exactly.",
      },
      { status: 422 }
    );
  }

  const gridPoints  = generateGrid(center.lat, center.lng);
  const snapshotDate = new Date().toISOString().split("T")[0];
  const kw          = keyword.trim();

  // Query all 25 grid points in parallel
  const rows = await Promise.all(
    gridPoints.map(async (point) => {
      const rank = await getRankAtPoint(kw, point.lat, point.lng, placeId!);
      return {
        business_id,
        keyword:       kw,
        lat:           point.lat,
        lng:           point.lng,
        rank_position: rank,
        grid_size:     GRID_SIZE,
        snapshot_date: snapshotDate,
        is_mock:       false,
      };
    })
  );

  // If every grid point came back null, the business doesn't rank for this
  // keyword anywhere in the area — refund the credit and tell the user.
  const hits = rows.filter((r) => r.rank_position !== null).length;
  if (hits === 0) {
    console.warn(`[rank/run-snapshot] zero hits for "${kw}" (business=${business_id}) — not charging credit`);
    return Response.json(
      {
        error:
          `Your business didn't rank in the top 20 for "${kw}" anywhere in the search area. No credit was used. Try a different keyword, or connect Google Business Profile to verify the listing.`,
      },
      { status: 422 },
    );
  }

  const { error: upsertError } = await supabase
    .from("rank_snapshots")
    .upsert(rows, { onConflict: "business_id,keyword,lat,lng,snapshot_date" });

  if (upsertError) {
    console.error("[rank/run-snapshot] upsert error:", upsertError);
    return Response.json({ error: "Failed to save snapshot." }, { status: 500 });
  }

  await incrementUsage(user.id, "rank_snapshot");

  console.log(`[rank/run-snapshot] ${rows.length} points saved (${hits} ranked) for "${kw}" (business=${business_id})`);
  return Response.json({ ok: true, points: rows.length, ranked: hits, keyword: kw });
}
