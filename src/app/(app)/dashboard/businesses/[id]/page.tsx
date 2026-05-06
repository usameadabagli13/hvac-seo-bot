import { redirect, notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import BusinessDetailTabs from "./BusinessDetailTabs";
import EditableBusinessHeader from "@/components/app/EditableBusinessHeader";
import { resolveTrialState } from "@/lib/trial";

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
    { plan },
  ] = await Promise.all([
    supabase
      .from("businesses")
      .select("*")
      .eq("id", id)
      .eq("user_id", session.user.id)
      .is("deleted_at", null)
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
    resolveTrialState(supabase, session.user.id),
  ]);

  if (!business) notFound();

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

        {/* Business header (editable) */}
        <EditableBusinessHeader
          business={{
            id:                       business.id,
            business_name:            business.business_name,
            service_location:         business.service_location,
            website_url:              business.website_url ?? null,
            phone:                    business.phone ?? null,
            street_address:           business.street_address ?? null,
            is_service_area_business: business.is_service_area_business ?? null,
            created_at:               business.created_at,
          }}
        />

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
