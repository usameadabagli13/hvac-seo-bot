"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Sparkles, CheckCircle2, MessageSquare, Loader2, Copy, Check, RefreshCw, Save } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Review {
  id: string;
  author: string;
  platform: "Google";
  rating: 1 | 2 | 3 | 4 | 5;
  body: string;
  date: string; // ISO date string
  sentiment: "positive" | "neutral" | "negative";
  replied: boolean;
  businessName: string;
  aiReply?: string | null;
}

export { MOCK_REVIEWS } from "@/lib/mock-reviews";

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1mo ago" : `${months}mo ago`;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 flex-shrink-0 ${
            i < rating ? "fill-zinc-300 text-zinc-300" : "fill-transparent text-zinc-700"
          }`}
        />
      ))}
    </div>
  );
}

const SENTIMENT_STYLES = {
  positive: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  neutral: "bg-white/[0.04] text-zinc-500 border-white/[0.08]",
  negative: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const PLATFORM_STYLES: Record<Review["platform"], string> = {
  Google: "bg-white/[0.04] text-zinc-500 border-white/[0.07]",
};

// ── Review card ───────────────────────────────────────────────────────────────
function ReviewCard({ review, isConnected }: { review: Review; isConnected: boolean }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [generating, setGenerating] = useState(false);
  // Seed from DB on mount so saved drafts survive page refresh
  const [reply, setReply] = useState<string | null>(review.aiReply ?? null);
  const [editedReply, setEditedReply] = useState(review.aiReply ?? "");
  const [genError, setGenError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(review.replied);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const isLong = review.body.length > 220;
  const displayBody =
    isLong && !expanded ? review.body.slice(0, 220).trimEnd() + "…" : review.body;

  const handleGenerate = async () => {
    setGenerating(true);
    setGenError(null);
    setLimitReached(false);
    try {
      const res = await fetch("/api/reviews/generate-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewBody: review.body,
          rating: review.rating,
          authorName: review.author,
          businessName: review.businessName,
          sentiment: review.sentiment,
        }),
      });
      const data = await res.json() as { reply?: string; error?: string };
      if (res.status === 429) {
        setLimitReached(true);
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Generation failed.");
      setReply(data.reply!);
      setEditedReply(data.reply!);
    } catch (err: unknown) {
      setGenError(err instanceof Error ? err.message : "Failed to generate reply.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editedReply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!editedReply.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/reviews/save-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review_id: review.id, reply_text: editedReply }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to save.");
      setSaved(true);
      router.refresh();
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Failed to save reply.");
    } finally {
      setSaving(false);
    }
  };

  const handlePostToGoogle = async () => {
    if (!editedReply.trim() || posting || posted) return;
    setPosting(true);
    setPostError(null);
    try {
      const res = await fetch("/api/reviews/post-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review_id: review.id, reply_text: editedReply }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to post reply.");
      setPosted(true);
      setSaved(true);
      router.refresh();
    } catch (err: unknown) {
      setPostError(err instanceof Error ? err.message : "Failed to post to Google.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-5 space-y-4 hover:border-white/[0.11] transition-colors duration-200">
      {/* Row 1: meta */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/[0.08] flex items-center justify-center text-xs font-bold text-zinc-300 flex-shrink-0 select-none">
            {review.author[0]}
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-200 leading-tight">
              {review.author}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <StarRating rating={review.rating} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-semibold uppercase tracking-wider ${SENTIMENT_STYLES[review.sentiment]}`}>
            {review.sentiment}
          </span>
          <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-medium ${PLATFORM_STYLES[review.platform]}`}>
            {review.platform}
          </span>
          <span className="text-[11px] text-zinc-600">{timeAgo(review.date)}</span>
        </div>
      </div>

      {/* Row 2: body */}
      <div>
        <p className="text-sm text-zinc-400 leading-relaxed">{displayBody}</p>
        {isLong && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>

      {/* Row 3: actions */}
      <div className="flex items-center justify-between pt-1 border-t border-white/[0.05]">
        {review.replied ? (
          <div className="flex items-center gap-1.5 text-xs text-zinc-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Replied
          </div>
        ) : (
          <div />
        )}

        <button
          onClick={handleGenerate}
          disabled={generating}
          className={`flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg border text-xs font-medium transition-all duration-150 disabled:pointer-events-none min-h-[36px] ${
            generating
              ? "bg-white/[0.03] border-white/[0.07] text-zinc-600"
              : reply
              ? "bg-white/[0.04] border-white/[0.09] text-zinc-400 hover:text-zinc-200 hover:border-white/[0.14]"
              : "bg-zinc-800/60 border-white/[0.10] text-zinc-300 hover:bg-zinc-700/60 hover:text-zinc-100 hover:border-white/[0.16] active:scale-[0.97] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
          }`}
        >
          {generating ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3" />
          )}
          {generating ? "Generating…" : reply ? "Regenerate" : "Generate AI Reply"}
        </button>
      </div>

      {/* Row 4: error / limit */}
      {genError && (
        <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
          {genError}
        </p>
      )}

      {limitReached && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] px-4 py-3 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-amber-400 mb-0.5">Monthly limit reached</p>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              You&apos;ve used all 5 AI reply generations for this month. Upgrade to Pro for unlimited replies.
            </p>
          </div>
          <a
            href="/settings?tab=billing"
            className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.10] text-xs font-semibold text-zinc-300 hover:bg-white/[0.10] hover:text-zinc-100 transition-all duration-150"
          >
            Upgrade
          </a>
        </div>
      )}

      {/* Row 5: reply draft panel */}
      {reply && (
        <div className="rounded-xl border border-white/[0.08] bg-zinc-900/50 overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-zinc-500" />
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                AI Reply Draft
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.05] transition-colors duration-150 disabled:opacity-40"
              >
                <RefreshCw className="w-3 h-3" />
                Regenerate
              </button>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-150 ${
                  copied
                    ? "text-emerald-400 bg-emerald-500/10"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]"
                }`}
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Editable reply */}
          <textarea
            value={editedReply}
            onChange={(e) => setEditedReply(e.target.value)}
            rows={4}
            spellCheck
            className="w-full px-4 py-3 bg-transparent text-sm text-zinc-300 leading-relaxed resize-none focus:outline-none placeholder:text-zinc-700"
          />

          {/* Footer: save + post actions */}
          <div className="px-4 py-2.5 border-t border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] text-zinc-700">
                {editedReply.length} chars · editable before saving
              </span>
              <div className="flex items-center gap-2">
                {/* Save Reply */}
                <button
                  onClick={handleSave}
                  disabled={saving || saved || !editedReply.trim()}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all duration-150 disabled:pointer-events-none ${
                    saved
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-white text-zinc-950 border-transparent hover:bg-zinc-100 active:scale-[0.97] disabled:opacity-40"
                  }`}
                >
                  {saving ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : saved ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <Save className="w-3 h-3" />
                  )}
                  {saving ? "Saving…" : saved ? "Saved!" : "Save Reply"}
                </button>

                <button
                  disabled={!isConnected || (!saved && !review.replied) || posting || posted}
                  onClick={handlePostToGoogle}
                  title={
                    !isConnected
                      ? "Connect Google Business Profile to post replies"
                      : !saved && !review.replied
                      ? "Save the reply first"
                      : posted
                      ? "Reply posted to Google"
                      : "Publish this reply directly to Google"
                  }
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-all duration-150 disabled:pointer-events-none ${
                    posted
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : saved || review.replied
                      ? "bg-white/[0.04] border-white/[0.10] text-zinc-400 hover:text-zinc-200 hover:border-white/[0.18] active:scale-[0.97]"
                      : "bg-white/[0.02] border-white/[0.05] text-zinc-700 cursor-not-allowed"
                  }`}
                >
                  {posting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : posted ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : null}
                  {posting ? "Posting…" : posted ? "Posted!" : "Post to Google"}
                </button>
              </div>
            </div>

            {saveError && (
              <p className="text-[11px] text-rose-400">{saveError}</p>
            )}
            {postError && (
              <p className="text-[11px] text-rose-400">{postError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Filter bar ────────────────────────────────────────────────────────────────
type SentimentFilter = "all" | "positive" | "neutral" | "negative";
type RepliedFilter = "all" | "unreplied";

const SENTIMENT_TABS: { id: SentimentFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "positive", label: "Positive" },
  { id: "neutral", label: "Neutral" },
  { id: "negative", label: "Negative" },
];

// ── Stats strip ───────────────────────────────────────────────────────────────
function StatsStrip({ reviews }: { reviews: Review[] }) {
  const avgRating =
    reviews.length === 0
      ? 0
      : reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const unreplied = reviews.filter((r) => !r.replied).length;
  const thisMonth = reviews.filter((r) => {
    const d = new Date(r.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const stats = [
    { label: "Total Reviews", value: reviews.length },
    { label: "Avg Rating", value: avgRating.toFixed(1) },
    { label: "Unreplied", value: unreplied },
    { label: "This Month", value: thisMonth },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
        >
          <p className="text-[11px] text-zinc-600 mb-0.5">{s.label}</p>
          <p className="text-xl font-semibold text-zinc-300 tabular-nums">{s.value}</p>
        </div>
      ))}
    </div>
  );
}

// ── Main feed ─────────────────────────────────────────────────────────────────
export default function ReviewFeed({
  reviews,
  isConnected = false,
}: {
  reviews: Review[];
  isConnected?: boolean;
}) {
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>("all");
  const [repliedFilter, setRepliedFilter] = useState<RepliedFilter>("all");

  const filtered = reviews.filter((r) => {
    if (sentimentFilter !== "all" && r.sentiment !== sentimentFilter) return false;
    if (repliedFilter === "unreplied" && r.replied) return false;
    return true;
  });

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/[0.07] bg-white/[0.01] px-6 py-16 flex flex-col items-center text-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-zinc-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-400 mb-1">
            {isConnected ? "No reviews yet" : "No reviews to show"}
          </p>
          <p className="text-xs text-zinc-600 max-w-xs leading-relaxed">
            {isConnected
              ? "Use the \"Sync Reviews\" button above to pull your latest Google reviews."
              : "Connect your Google Business Profile above to import real customer reviews and start generating AI replies."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <StatsStrip reviews={reviews} />

      {/* Filter controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        {/* Sentiment tabs */}
        <div className="flex items-center gap-0.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
          {SENTIMENT_TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setSentimentFilter(id)}
              className={`px-3 py-2 sm:py-1.5 rounded-lg text-xs font-medium transition-all duration-150 min-h-[36px] ${
                sentimentFilter === id
                  ? "bg-white/[0.08] text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Unreplied toggle */}
        <button
          onClick={() =>
            setRepliedFilter((v) => (v === "all" ? "unreplied" : "all"))
          }
          className={`flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 min-h-[36px] ${
            repliedFilter === "unreplied"
              ? "bg-white/[0.07] border-white/[0.12] text-zinc-200"
              : "bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.10]"
          }`}
        >
          <MessageSquare className="w-3 h-3" />
          Unreplied only
        </button>
      </div>

      {/* Results count */}
      <p className="text-xs text-zinc-600 mb-4">
        {filtered.length === reviews.length
          ? `${reviews.length} review${reviews.length !== 1 ? "s" : ""}`
          : `${filtered.length} of ${reviews.length} review${reviews.length !== 1 ? "s" : ""}`}
      </p>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.07] bg-white/[0.01] px-6 py-14 text-center">
          <p className="text-sm text-zinc-500 mb-1">No reviews match this filter</p>
          <p className="text-xs text-zinc-700">Try adjusting the filters above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((review) => (
            <ReviewCard key={review.id} review={review} isConnected={isConnected} />
          ))}
        </div>
      )}

      {!isConnected && (
        <div className="mt-8 rounded-xl border border-white/[0.05] bg-white/[0.01] px-5 py-4 flex items-start gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-1.5 flex-shrink-0" />
          <p className="text-xs text-zinc-600 leading-relaxed">
            <span className="text-zinc-500 font-medium">Showing mock data.</span>{" "}
            Connect Google Business Profile above to pull your live reviews and unlock
            the AI reply generator.
          </p>
        </div>
      )}
    </div>
  );
}
