import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { postGBPReviewReply } from "@/lib/gbp";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json() as { review_id?: string; reply_text?: string };
  const { review_id, reply_text } = body;

  if (!review_id || !reply_text?.trim()) {
    return Response.json(
      { error: "review_id and reply_text are required." },
      { status: 400 },
    );
  }

  // Verify the review belongs to this user
  const { data: review } = await supabase
    .from("reviews")
    .select("id")
    .eq("review_id", review_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!review) {
    return Response.json({ error: "Review not found." }, { status: 404 });
  }

  const result = await postGBPReviewReply(user.id, review_id, reply_text.trim());

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 502 });
  }

  // Mark as replied in DB
  await supabase
    .from("reviews")
    .update({ is_replied: true, ai_reply: reply_text.trim() })
    .eq("review_id", review_id)
    .eq("user_id", user.id);

  console.log(`[reviews/post-reply] posted reply for review_id=${review_id}`);
  return Response.json({ ok: true });
}
