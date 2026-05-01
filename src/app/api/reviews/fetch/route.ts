import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getGBPReviews } from "@/lib/gbp";
import { MOCK_REVIEWS } from "@/lib/mock-reviews";
import { analyzeSentiments } from "@/lib/sentiment";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Optional business_id in body — defaults to the user's most recent business
  let businessId: string | null = null;
  try {
    const body = await request.json() as { business_id?: string };
    businessId = body.business_id ?? null;
  } catch {
    // body is optional — swallow parse errors
  }

  if (businessId) {
    // Verify the caller owns this business
    const { data: owned } = await supabase
      .from("businesses")
      .select("id")
      .eq("id", businessId)
      .eq("user_id", user.id)
      .single();

    if (!owned) {
      return Response.json({ error: "Business not found." }, { status: 404 });
    }
  } else {
    const { data: first } = await supabase
      .from("businesses")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!first) {
      return Response.json(
        { error: "No businesses found. Add a business first." },
        { status: 422 }
      );
    }
    businessId = first.id;
  }

  // Pull live reviews from GBP
  let reviews = await getGBPReviews(user.id);

  if (reviews === null) {
    // In development, fall back to mock data so the full Phase 3 flow is testable
    // without a verified GBP OAuth connection.
    if (process.env.NODE_ENV === "development") {
      console.log("[reviews/fetch] dev mode — GBP not connected, seeding mock reviews");
      reviews = MOCK_REVIEWS;
    } else {
      return Response.json(
        { error: "Google Business Profile is not connected or the access token is invalid." },
        { status: 422 }
      );
    }
  }

  if (reviews.length === 0) {
    return Response.json({ upserted: 0, total: 0 });
  }

  // Run Gemini sentiment analysis on the full batch before writing to DB.
  // Falls back silently to the rating-based heuristic per review on API failure.
  const sentimentMap = await analyzeSentiments(
    reviews.map((r) => ({ review_id: r.id, body: r.body }))
  );

  // Map Review → DB row, embedding AI sentiment where available
  const rows = reviews.map((r) => ({
    user_id:     user.id,
    business_id: businessId as string,
    platform:    r.platform,
    review_id:   r.id,
    author:      r.author,
    rating:      r.rating,
    body:        r.body,
    sentiment:   sentimentMap.get(r.id) ?? r.sentiment,
    review_date: r.date,
    fetched_at:  new Date().toISOString(),
  }));

  // Upsert: insert new rows, update fetched_at + sentiment on conflict
  const { error: upsertError, count } = await supabase
    .from("reviews")
    .upsert(rows, {
      onConflict: "business_id,platform,review_id",
      ignoreDuplicates: false,   // update fetched_at on re-sync
      count: "exact",
    });

  if (upsertError) {
    console.error("[reviews/fetch] upsert error:", upsertError);
    return Response.json({ error: "Failed to save reviews to database." }, { status: 500 });
  }

  console.log(
    `[reviews/fetch] synced ${rows.length} GBP reviews → ${count ?? rows.length} upserted for business ${businessId}`
  );

  return Response.json({ upserted: count ?? rows.length, total: rows.length });
}
