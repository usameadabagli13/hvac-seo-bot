import { redirect, notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ChevronLeft, Building2, MapPin, Globe, Calendar } from "lucide-react";
import BusinessDetailTabs from "./BusinessDetailTabs";

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const [
    { data: business },
    { count: reviewCount, data: reviewsData },
    { data: rankSnapshots },
    { data: seoAudits },
    { data: competitors },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from("businesses")
      .select("*")
      .eq("id", id)
      .eq("user_id", session.user.id)
      .maybeSingle(),
    supabase
      .from("reviews")
      .select("id, rating, body, author, review_date, sentiment, replied_at", {
        count: "exact",
      })
      .eq("business_id", id)
      .order("review_date", { ascending: false })
      .limit(20),
    supabase
      .from("rank_snapshots")
      .select("keyword, rank_position, snapshot_date")
      .eq("business_id", id)
      .order("snapshot_date", { ascending: false })
      .limit(20),
    supabase
      .from("seo_audits")
      .select("score, audited_at, crawled_url, issues")
      .eq("business_id", id)
      .order("audited_at", { ascending: false })
      .limit(1),
    supabase
      .from("competitors")
      .select("id, name, avg_rating, review_count")
      .eq("business_id", id)
      .limit(10),
    supabase
      .from("profiles")
      .select("plan")
      .eq("user_id", session.user.id)
      .maybeSingle(),
  ]);

  if (!business) notFound();

  const plan =
    (profile?.plan as "starter" | "pro" | "agency" | undefined) ?? "starter";

  const avgRating =
    reviewsData && reviewsData.length > 0
      ? reviewsData.reduce((sum, r) => sum + (r.rating ?? 0), 0) /
        reviewsData.length
      : null;

  const keywords = Array.isArray(business.target_keywords)
    ? (business.target_keywords as string[])
    : [];

  return (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-zinc-700/10 rounded-full blur-[140px]" />
      </div>

      <main className="relative max-w-5xl mx-auto px-6 py-10">
        {/* Back nav */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition-colors mb-7"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          All Businesses
        </Link>

        {/* Business header */}
        <div className="mb-8 flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
            <Building2 className="w-5 h-5 text-zinc-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
              {business.business_name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
              <span className="flex items-center gap-1 text-xs text-zinc-500">
                <MapPin className="w-3 h-3" />
                {business.service_location}
              </span>
              {business.website_url && (
                <a
                  href={business.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <Globe className="w-3 h-3" />
                  {business.website_url}
                </a>
              )}
              <span className="flex items-center gap-1 text-xs text-zinc-600">
                <Calendar className="w-3 h-3" />
                Added{" "}
                {new Date(business.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Reviews", value: reviewCount ?? 0 },
            {
              label: "Avg Rating",
              value: avgRating != null ? avgRating.toFixed(1) + " ★" : "—",
            },
            { label: "Keywords", value: keywords.length },
            { label: "Rank Checks", value: rankSnapshots?.length ?? 0 },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <p className="text-xs text-zinc-600 mb-1">{stat.label}</p>
              <p className="text-xl font-semibold text-zinc-300">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tab content (client) */}
        <BusinessDetailTabs
          business={{
            id: business.id,
            business_name: business.business_name,
            service_location: business.service_location,
            website_url: business.website_url ?? null,
            target_keywords: keywords,
            is_service_area_business: business.is_service_area_business ?? null,
            created_at: business.created_at,
          }}
          userId={session.user.id}
          plan={plan}
          reviews={reviewsData ?? []}
          rankSnapshots={rankSnapshots ?? []}
          latestAudit={seoAudits?.[0] ?? null}
          competitors={competitors ?? []}
        />
      </main>
    </>
  );
}
