"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Tag,
  MessageSquare,
  Search,
  Users,
  Star,
  CheckCircle2,
  Clock,
  ExternalLink,
  Lock,
  TrendingUp,
  AlertCircle,
  Loader2,
  Play,
  AlertTriangle,
  Info,
} from "lucide-react";
import BusinessForm from "../../BusinessForm";
import type { Business } from "../../BusinessManager";
import UpgradeGate from "@/components/paywall/UpgradeGate";

type Tab = "overview" | "keywords" | "reviews" | "seo" | "competitors";

interface Review {
  id: string;
  rating: number | null;
  body: string | null;
  author: string | null;
  review_date: string | null;
  sentiment: string | null;
  replied_at: string | null;
}

interface RankSnapshot {
  keyword: string;
  rank_position: number;
  snapshot_date: string;
}

interface SeoIssue {
  severity:    "critical" | "warning" | "info";
  element:     string;
  current:     string | null;
  recommended: string;
}

interface SeoAudit {
  score: number | null;
  audited_at: string;
  crawled_url: string | null;
  issues: unknown;
}

const SEVERITY_STYLES: Record<SeoIssue["severity"], { badge: string; icon: React.ReactNode; label: string }> = {
  critical: {
    badge: "bg-rose-500/10 border-rose-500/25 text-rose-400",
    icon:  <AlertTriangle className="w-3 h-3" />,
    label: "Critical",
  },
  warning: {
    badge: "bg-amber-500/10 border-amber-500/25 text-amber-400",
    icon:  <AlertCircle className="w-3 h-3" />,
    label: "Warning",
  },
  info: {
    badge: "bg-zinc-500/10 border-zinc-500/25 text-zinc-400",
    icon:  <Info className="w-3 h-3" />,
    label: "Info",
  },
};

interface Competitor {
  id: string;
  name: string;
  avg_rating: number | null;
  review_count: number | null;
}

interface Props {
  business: Business;
  userId: string;
  plan: "starter" | "pro" | "agency";
  reviews: Review[];
  rankSnapshots: RankSnapshot[];
  latestAudit: SeoAudit | null;
  competitors: Competitor[];
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview",     label: "Overview",    icon: <BarChart3 className="w-3.5 h-3.5" /> },
  { id: "keywords",     label: "Keywords",    icon: <Tag className="w-3.5 h-3.5" /> },
  { id: "reviews",      label: "Reviews",     icon: <MessageSquare className="w-3.5 h-3.5" /> },
  { id: "seo",          label: "SEO Audit",   icon: <Search className="w-3.5 h-3.5" /> },
  { id: "competitors",  label: "Competitors", icon: <Users className="w-3.5 h-3.5" /> },
];

const SENTIMENT_COLORS: Record<string, string> = {
  positive: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  neutral:  "text-amber-400  bg-amber-500/10  border-amber-500/20",
  negative: "text-rose-400   bg-rose-500/10   border-rose-500/20",
};

export default function BusinessDetailTabs({
  business,
  userId,
  plan,
  reviews,
  rankSnapshots,
  latestAudit,
  competitors,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [auditing,    setAuditing]    = useState(false);
  const [auditError,  setAuditError]  = useState<string | null>(null);

  // Competitor add state
  const [compQuery,    setCompQuery]    = useState("");
  const [compAdding,   setCompAdding]   = useState(false);
  const [compError,    setCompError]    = useState<string | null>(null);

  const handleAddCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compQuery.trim() || compAdding) return;
    setCompAdding(true);
    setCompError(null);
    try {
      const res = await fetch("/api/competitors", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ business_id: business.id, query: compQuery.trim() }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) {
        setCompError(data.error ?? "Couldn't add competitor.");
        return;
      }
      setCompQuery("");
      router.refresh();
    } catch {
      setCompError("Network error.");
    } finally {
      setCompAdding(false);
    }
  };

  const handleRemoveCompetitor = async (id: string) => {
    if (!confirm("Stop tracking this competitor?")) return;
    try {
      const res = await fetch(`/api/competitors?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } catch {}
  };

  const handleRunAudit = async () => {
    setAuditing(true);
    setAuditError(null);
    try {
      const res = await fetch("/api/seo/audit", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ business_id: business.id }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) {
        setAuditError(data.error ?? "Audit failed.");
        return;
      }
      router.refresh();
    } catch {
      setAuditError("Network error. Please try again.");
    } finally {
      setAuditing(false);
    }
  };

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-white/[0.07] mb-6 overflow-x-auto scrollbar-none pb-px">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium rounded-t-lg whitespace-nowrap transition-all duration-150 ${
              activeTab === tab.id
                ? "text-zinc-100 border-b-2 border-zinc-100 -mb-px"
                : "text-zinc-600 hover:text-zinc-400"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Overview ─────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {isEditing ? (
            <BusinessForm
              userId={userId}
              editingBusiness={business}
              onSaved={() => setIsEditing(false)}
              onCancelEdit={() => setIsEditing(false)}
            />
          ) : (
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                  Business Info
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-zinc-600 hover:text-zinc-300 border border-white/[0.07] hover:border-white/[0.14] px-3 py-1.5 rounded-lg transition-all duration-150"
                >
                  Edit
                </button>
              </div>
              <dl className="divide-y divide-white/[0.04]">
                {[
                  { label: "Business Name", value: business.business_name },
                  { label: "Service Location", value: business.service_location },
                  {
                    label: "Website",
                    value: business.website_url ? (
                      <a
                        href={business.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors"
                      >
                        {business.website_url}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-zinc-600 italic">Not set</span>
                    ),
                  },
                  {
                    label: "Keywords",
                    value: `${(business.target_keywords?.length ?? 0)} keywords`,
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="px-5 py-3 flex items-center justify-between gap-4"
                  >
                    <dt className="text-xs text-zinc-600">{label}</dt>
                    <dd className="text-xs text-zinc-300 text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Quick links to other tabs */}
          {!isEditing && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  tab: "keywords" as Tab,
                  icon: Tag,
                  label: "Manage Keywords",
                  count: (business.target_keywords?.length ?? 0),
                },
                {
                  tab: "reviews" as Tab,
                  icon: MessageSquare,
                  label: "View Reviews",
                  count: reviews.length,
                },
                {
                  tab: "seo" as Tab,
                  icon: Search,
                  label: "SEO Audit",
                  count: latestAudit ? 1 : 0,
                },
                {
                  tab: "competitors" as Tab,
                  icon: Users,
                  label: "Competitors",
                  count: competitors.length,
                },
              ].map(({ tab, icon: Icon, label, count }) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex flex-col items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4 hover:border-white/[0.11] hover:bg-white/[0.04] transition-all duration-150 text-left"
                >
                  <Icon className="w-4 h-4 text-zinc-600" />
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 mb-0.5">
                      {label}
                    </p>
                    <p className="text-lg font-semibold text-zinc-300">{count}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Keywords ─────────────────────────────────────────────────────── */}
      {activeTab === "keywords" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">
              {(business.target_keywords?.length ?? 0)} keywords targeting{" "}
              <span className="text-zinc-300">{business.service_location}</span>
            </p>
            <button
              onClick={() => {
                setActiveTab("overview");
                setIsEditing(true);
              }}
              className="text-xs text-zinc-600 hover:text-zinc-300 border border-white/[0.07] hover:border-white/[0.14] px-3 py-1.5 rounded-lg transition-all duration-150"
            >
              Edit Keywords
            </button>
          </div>

          {(business.target_keywords?.length ?? 0) === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/[0.07] bg-white/[0.01] px-5 py-12 flex flex-col items-center text-center gap-3">
              <Tag className="w-5 h-5 text-zinc-700" />
              <div>
                <p className="text-xs font-medium text-zinc-500 mb-1">
                  No keywords yet
                </p>
                <p className="text-[11px] text-zinc-700">
                  Go to Overview → Edit to add or generate keywords with AI.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              <div className="flex flex-wrap gap-2">
                {(business.target_keywords ?? []).map((kw, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.09] text-xs text-zinc-300 font-medium"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {rankSnapshots.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
                Latest Rank Positions
              </p>
              <div className="space-y-2">
                {rankSnapshots.slice(0, 10).map((snap, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5"
                  >
                    <span className="text-xs text-zinc-400">{snap.keyword}</span>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-semibold tabular-nums ${
                          snap.rank_position <= 3
                            ? "text-emerald-400"
                            : snap.rank_position <= 10
                            ? "text-amber-400"
                            : "text-zinc-500"
                        }`}
                      >
                        #{snap.rank_position}
                      </span>
                      <span className="text-[11px] text-zinc-700">
                        {snap.snapshot_date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/rank"
                className="inline-flex items-center gap-1.5 mt-3 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                <TrendingUp className="w-3 h-3" />
                Open Rank Tracker
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── Reviews ──────────────────────────────────────────────────────── */}
      {activeTab === "reviews" && (
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/[0.07] bg-white/[0.01] px-5 py-12 flex flex-col items-center text-center gap-3">
              <MessageSquare className="w-5 h-5 text-zinc-700" />
              <div>
                <p className="text-xs font-medium text-zinc-500 mb-1">
                  No reviews yet
                </p>
                <p className="text-[11px] text-zinc-700">
                  Connect Google Business Profile and sync to import reviews.
                </p>
              </div>
              <Link
                href="/reviews"
                className="text-xs text-zinc-500 hover:text-zinc-300 border border-white/[0.07] hover:border-white/[0.14] px-3 py-1.5 rounded-lg transition-all duration-150"
              >
                Go to Reviews
              </Link>
            </div>
          ) : (
            <>
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-zinc-300">
                          {review.author ?? "Anonymous"}
                        </span>
                        {review.sentiment && (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${
                              SENTIMENT_COLORS[review.sentiment] ??
                              "text-zinc-500 bg-zinc-500/10 border-zinc-500/20"
                            }`}
                          >
                            {review.sentiment}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        {Array.from({ length: 5 }).map((_, si) => (
                          <Star
                            key={si}
                            className={`w-3 h-3 ${
                              si < (review.rating ?? 0)
                                ? "fill-zinc-300 text-zinc-300"
                                : "text-zinc-700"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {review.replied_at ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-500">
                          <CheckCircle2 className="w-3 h-3" />
                          Replied
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-zinc-600">
                          <Clock className="w-3 h-3" />
                          Unreplied
                        </span>
                      )}
                      <span className="text-[11px] text-zinc-700">
                        {review.review_date}
                      </span>
                    </div>
                  </div>
                  {review.body && (
                    <p className="text-xs text-zinc-500 leading-relaxed line-clamp-3">
                      {review.body}
                    </p>
                  )}
                </div>
              ))}
              <Link
                href="/reviews"
                className="inline-flex items-center gap-1.5 mt-1 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                <MessageSquare className="w-3 h-3" />
                Manage all reviews →
              </Link>
            </>
          )}
        </div>
      )}

      {/* ── SEO Audit ────────────────────────────────────────────────────── */}
      {activeTab === "seo" && (
        <UpgradeGate
          plan={plan}
          requiredPlan="pro"
          feature="SEO Audit"
        >
          <div className="space-y-4">
            {/* Run Audit button */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-zinc-200">On-page SEO audit</p>
                <p className="text-xs text-zinc-600 mt-0.5">
                  We crawl your homepage, then Gemini scores it and flags issues.
                </p>
              </div>
              <button
                onClick={handleRunAudit}
                disabled={auditing || !business.website_url}
                title={!business.website_url ? "Add a website URL first" : "Uses 1 of your monthly audit credits"}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100 active:scale-[0.97] transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                {auditing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {auditing ? "Auditing…" : latestAudit ? "Re-run audit" : "Run audit"}
              </button>
            </div>
            {auditError && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                {auditError}
              </p>
            )}

            {latestAudit ? (
              <>
                {/* Score card */}
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                      Latest Audit
                    </p>
                    <span className="text-[11px] text-zinc-600">{latestAudit.audited_at}</span>
                  </div>
                  <div className="px-5 py-5 flex items-center gap-6">
                    <div className="flex-shrink-0 text-center">
                      <p
                        className={`text-4xl font-bold tabular-nums ${
                          (latestAudit.score ?? 0) >= 80
                            ? "text-emerald-400"
                            : (latestAudit.score ?? 0) >= 50
                            ? "text-amber-400"
                            : "text-rose-400"
                        }`}
                      >
                        {latestAudit.score ?? "—"}
                      </p>
                      <p className="text-[10px] text-zinc-600 mt-0.5">SEO Score</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      {latestAudit.crawled_url && (
                        <p className="text-xs text-zinc-500 truncate mb-1">
                          {latestAudit.crawled_url}
                        </p>
                      )}
                      <p className="text-xs text-zinc-600">
                        Issues found:{" "}
                        {Array.isArray(latestAudit.issues) ? latestAudit.issues.length : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Issue list */}
                {Array.isArray(latestAudit.issues) && latestAudit.issues.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest pt-2">
                      Recommendations
                    </p>
                    {(latestAudit.issues as SeoIssue[]).map((issue, i) => {
                      const style = SEVERITY_STYLES[issue.severity] ?? SEVERITY_STYLES.info;
                      return (
                        <div key={i} className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3.5 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-semibold uppercase tracking-wider ${style.badge}`}>
                              {style.icon}
                              {style.label}
                            </span>
                            <span className="text-xs font-semibold text-zinc-300">{issue.element}</span>
                          </div>
                          {issue.current && (
                            <p className="text-[11px] text-zinc-600">
                              <span className="text-zinc-700">Now:</span> {issue.current}
                            </p>
                          )}
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            <span className="text-emerald-500/80 font-semibold">Fix:</span> {issue.recommended}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/[0.07] bg-white/[0.01] px-5 py-12 flex flex-col items-center text-center gap-3">
                <AlertCircle className="w-5 h-5 text-zinc-700" />
                <div>
                  <p className="text-xs font-medium text-zinc-500 mb-1">No audit run yet</p>
                  <p className="text-[11px] text-zinc-700">
                    Click <span className="text-zinc-500 font-semibold">Run audit</span> above to analyse your homepage. Uses 1 monthly credit.
                  </p>
                </div>
              </div>
            )}
          </div>
        </UpgradeGate>
      )}

      {/* ── Competitors ──────────────────────────────────────────────────── */}
      {activeTab === "competitors" && (
        <UpgradeGate
          plan={plan}
          requiredPlan="pro"
          feature="Competitor Tracking"
        >
          <div className="space-y-4">
            {/* Add competitor */}
            <form onSubmit={handleAddCompetitor} className="space-y-2">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                Add a competitor
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={compQuery}
                  onChange={(e) => setCompQuery(e.target.value)}
                  placeholder='e.g. "Acme HVAC Dallas TX"'
                  disabled={compAdding}
                  className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={compAdding || !compQuery.trim()}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100 active:scale-[0.97] transition-all disabled:opacity-40"
                >
                  {compAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                  {compAdding ? "Finding…" : "Track"}
                </button>
              </div>
              {compError && <p className="text-xs text-rose-400">{compError}</p>}
              <p className="text-[11px] text-zinc-700">
                We&apos;ll find them on Google Maps and pull rating + review count.
                Pro = 3 competitors, Agency = 10.
              </p>
            </form>

            {/* List */}
            {competitors.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/[0.07] bg-white/[0.01] px-5 py-12 flex flex-col items-center text-center gap-3">
                <Users className="w-5 h-5 text-zinc-700" />
                <div>
                  <p className="text-xs font-medium text-zinc-500 mb-1">No competitors tracked yet</p>
                  <p className="text-[11px] text-zinc-700">Add your top 3 rivals to compare reviews and ratings.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest pt-2">
                  Tracked rivals · {competitors.length}
                </p>
                {competitors.map((comp) => (
                  <div
                    key={comp.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 hover:border-white/[0.10] transition-colors"
                  >
                    <p className="text-sm text-zinc-200 font-medium truncate">{comp.name}</p>
                    <div className="flex items-center gap-4 text-xs text-zinc-500 flex-shrink-0">
                      {comp.avg_rating != null && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {comp.avg_rating.toFixed(1)}
                        </span>
                      )}
                      {comp.review_count != null && (
                        <span>{comp.review_count} reviews</span>
                      )}
                      <button
                        onClick={() => handleRemoveCompetitor(comp.id)}
                        title="Remove"
                        className="text-zinc-700 hover:text-rose-400 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </UpgradeGate>
      )}
    </div>
  );
}
