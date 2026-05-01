import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json() as { review_id?: string; reply_text?: string };
  const { review_id, reply_text } = body;

  if (!review_id || !reply_text?.trim()) {
    return Response.json(
      { error: "review_id and reply_text are required." },
      { status: 400 }
    );
  }

  const { error: updateError, count } = await supabase
    .from("reviews")
    .update({
      ai_reply:   reply_text.trim(),
      is_replied: true,
    })
    .eq("review_id", review_id)
    .eq("user_id", user.id);

  if (updateError) {
    console.error("[reviews/save-reply] update error:", updateError);
    return Response.json({ error: "Failed to save reply." }, { status: 500 });
  }

  if (count === 0) {
    return Response.json({ error: "Review not found." }, { status: 404 });
  }

  console.log(`[reviews/save-reply] saved reply for review_id=${review_id}`);
  return Response.json({ ok: true });
}
