import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ReviewFeed, { MOCK_REVIEWS, type Review } from "@/components/app/ReviewFeed";
import { getGBPStatus } from "@/lib/gbp";
import GBPConnectBanner from "@/components/app/GBPConnectBanner";
import SyncReviewsButton from "@/components/app/SyncReviewsButton";
import RatingDistributionChart from "@/components/app/RatingDistributionChart";

export const metadata: Metadata = {
  title: "Reviews — HeatRank AI",
};

const ERROR_MESSAGES: Record<string, string> = {
  oauth_denied: "Google authorization was cancelled.",
  oauth_invalid: "Invalid OAuth response. Please try again.",
  oauth_csrf: "Security check failed. Please try again.",
  token_exchange_failed: "Failed to exchange authorization code. Check your Google Cloud credentials.",
  no_session: "Session expired. Please sign in again.",
  db_error: "Failed to save your connection. Please try again.",
};

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/login");

  const [{ error: oauthError }, gbpStatus, { data: dbRows }, { data: firstBiz }] = await Promise.all([
    searchParams,
    getGBPStatus(user.id),
    supabase
      .from("reviews")
      .select("review_id, author, platform, rating, body, sentiment, ai_reply, replied_at, review_date, fetched_at, business_id, businesses(business_name)")
      .eq("user_id", user.id)
      .order("review_date", { ascending: false })
      .limit(50),
    supabase
      .from("businesses")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  // ── Load reviews from DB ─────────────────────────────────────────────────────
  // Phase 3.2: reviews are persisted in the `reviews` table and shown from there.
  // The "Sync Reviews" button calls /api/reviews/fetch to pull fresh data from GBP.

  // Map DB rows → Review type used by ReviewFeed
  let reviews: Review[] = MOCK_REVIEWS;
  let fromDB = false;
  let lastFetchedAt: string | null = null;

  if (dbRows && dbRows.length > 0) {
    fromDB = true;
    lastFetchedAt = dbRows[0].fetched_at ?? null;
    reviews = dbRows.map((row) => {
      const bizRaw = row.businesses as unknown as { business_name: string } | { business_name: string }[] | null;
      const biz = Array.isArray(bizRaw) ? bizRaw[0] ?? null : bizRaw;
      return {
        id:           row.review_id,
        author:       row.author,
        platform:     row.platform as Review["platform"],
        rating:       row.rating as Review["rating"],
        body:         row.body,
        date:         row.review_date,
        sentiment:    row.sentiment as Review["sentiment"],
        replied:      row.replied_at !== null,
        aiReply:      row.ai_reply ?? null,
        businessName: biz?.business_name ?? "Your Business",
      };
    });
  }

  // Rating distribution for the chart (computed from whichever data source is active)
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>;
  for (const r of reviews) {
    distribution[r.rating] = (distribution[r.rating] ?? 0) + 1;
  }

  return (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[700px] h-[400px] bg-zinc-700/8 rounded-full blur-[140px]" />
      </div>

      <main className="relative max-w-4xl mx-auto px-6 py-12">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2">
              Reputation
            </p>
            <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
              Reviews
            </h1>
            <p className="mt-1.5 text-sm text-zinc-500 max-w-xl leading-relaxed">
              Monitor customer feedback, track sentiment, and respond to reviews across
              Google, Yelp, and Facebook — all from one place.
            </p>
          </div>

          {/* Sync button — only shown when GBP is connected */}
          {gbpStatus.connected && (
            <div className="flex-shrink-0 pt-1">
              <SyncReviewsButton
                businessId={firstBiz?.id}
                lastFetchedAt={lastFetchedAt}
              />
            </div>
          )}
        </div>

        {/* OAuth error banner */}
        {oauthError && (
          <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-4 py-3 text-sm text-rose-400">
            {ERROR_MESSAGES[oauthError] ?? "An error occurred connecting to Google. Please try again."}
          </div>
        )}

        {/* GBP connect / status banner */}
        <GBPConnectBanner
          isConnected={gbpStatus.connected}
          locationName={gbpStatus.locationName}
          apiError={false}
        />

        {/* DB source notice */}
        {fromDB && (
          <div className="mb-6 flex items-center gap-2 text-[11px] text-zinc-600">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0" />
            Showing {reviews.length} review{reviews.length !== 1 ? "s" : ""} from your database.
            {gbpStatus.connected && (
              <span>Use &ldquo;Sync Reviews&rdquo; above to pull the latest from Google.</span>
            )}
          </div>
        )}

        {/* Sentiment analysis insights row */}
        <div className="mb-8">
          <RatingDistributionChart distribution={distribution} total={reviews.length} />
        </div>

        <ReviewFeed reviews={reviews} isConnected={gbpStatus.connected} />
      </main>
    </>
  );
}
