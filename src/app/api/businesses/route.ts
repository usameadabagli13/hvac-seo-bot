import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { validateUrl, normalizeUrl, InvalidUrlError } from "@/utils/url";

function parseWebsiteUrl(raw: string | null | undefined): string | null {
  if (!raw || !raw.trim()) return null;
  const normalized = normalizeUrl(raw.trim());
  const parsed = validateUrl(normalized); // throws InvalidUrlError if invalid
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new InvalidUrlError(raw);
  }
  return parsed.href;
}

// POST /api/businesses — create a new business
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const businessName = typeof body.business_name === "string" ? body.business_name.trim() : "";
  const serviceLocation = typeof body.service_location === "string" ? body.service_location.trim() : "";
  const rawUrl = typeof body.website_url === "string" ? body.website_url : null;
  const keywords = Array.isArray(body.target_keywords) ? body.target_keywords as string[] : [];
  const isSab = typeof body.is_service_area_business === "boolean" ? body.is_service_area_business : false;

  if (!businessName) {
    return Response.json({ error: "Business name is required." }, { status: 422 });
  }
  if (!serviceLocation) {
    return Response.json({ error: "Service location is required." }, { status: 422 });
  }

  let websiteUrl: string | null;
  try {
    websiteUrl = parseWebsiteUrl(rawUrl);
  } catch (err) {
    if (err instanceof InvalidUrlError) {
      return Response.json(
        { error: "Invalid website URL. Please enter a valid URL (e.g. https://yoursite.com)." },
        { status: 422 },
      );
    }
    throw err;
  }

  const { data, error: dbError } = await supabase
    .from("businesses")
    .insert({
      user_id: user.id,
      business_name: businessName,
      service_location: serviceLocation,
      website_url: websiteUrl,
      target_keywords: keywords,
      is_service_area_business: isSab,
    })
    .select("id")
    .single();

  if (dbError) {
    console.error("[api/businesses] insert error:", dbError);
    return Response.json({ error: "Failed to create business. Please try again." }, { status: 500 });
  }

  return Response.json({ id: data.id }, { status: 201 });
}

// PATCH /api/businesses — partial update. Only fields explicitly present in
// the body are touched, so callers can safely send a subset (e.g. just
// business_name + service_location, leaving target_keywords untouched).
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : null;
  if (!id) {
    return Response.json({ error: "Business ID is required." }, { status: 422 });
  }

  const updates: Record<string, unknown> = {};

  if ("business_name" in body) {
    const v = typeof body.business_name === "string" ? body.business_name.trim() : "";
    if (!v) return Response.json({ error: "Business name is required." }, { status: 422 });
    updates.business_name = v;
  }

  if ("service_location" in body) {
    const v = typeof body.service_location === "string" ? body.service_location.trim() : "";
    if (!v) return Response.json({ error: "Service location is required." }, { status: 422 });
    updates.service_location = v;
  }

  if ("website_url" in body) {
    try {
      updates.website_url = parseWebsiteUrl(
        typeof body.website_url === "string" ? body.website_url : null,
      );
    } catch (err) {
      if (err instanceof InvalidUrlError) {
        return Response.json(
          { error: "Invalid website URL. Please enter a valid URL (e.g. https://yoursite.com)." },
          { status: 422 },
        );
      }
      throw err;
    }
  }

  if ("target_keywords" in body && Array.isArray(body.target_keywords)) {
    updates.target_keywords = body.target_keywords as string[];
  }

  if ("is_service_area_business" in body && typeof body.is_service_area_business === "boolean") {
    updates.is_service_area_business = body.is_service_area_business;
  }

  if ("deleted_at" in body) {
    // Accept null (restore) or true (delete now); ignore other values
    if (body.deleted_at === null) {
      updates.deleted_at = null;
    } else if (body.deleted_at === true || typeof body.deleted_at === "string") {
      updates.deleted_at = new Date().toISOString();
    }
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: "No fields to update." }, { status: 422 });
  }

  const { error: dbError } = await supabase
    .from("businesses")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id); // RLS enforced in query too

  if (dbError) {
    console.error("[api/businesses] update error:", dbError);
    return Response.json({ error: "Failed to update business. Please try again." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
