import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import RankMapLoader from "@/components/app/RankMapLoader";
import BusinessSwitcher from "@/components/app/BusinessSwitcher";
import type { HeatmapPoint } from "@/components/app/RankMap";

export const metadata: Metadata = {
  title: "Rank Tracker — HeatRank AI",
};

export default async function RankPage({
  searchParams,
}: {
  searchParams: Promise<{ business?: string }>;
}) {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/login");

  // Load user's businesses + GBP connection status in parallel
  const [{ data: businesses }, { data: gbpIntegration }] = await Promise.all([
    supabase
      .from("businesses")
      .select("id, business_name, service_location")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("integrations")
      .select("id, location_name")
      .eq("user_id", user.id)
      .eq("provider", "google_business_profile")
      .maybeSingle(),
  ]);
  const gbpConnected = !!gbpIntegration?.location_name;

  const { business: selectedId } = await searchParams;
  const biz =
    (selectedId && businesses?.find((b) => b.id === selectedId)) ||
    businesses?.[0] ||
    null;

  // ── Geocode service_location for map center ───────────────────────────────
  let centerLat = 39.5;
  let centerLng = -98.35;
  if (biz?.service_location && process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    try {
      const geoRes = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(biz.service_location)}.json?limit=1&types=place,district,region&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`,
        { next: { revalidate: 86400 } }
      );
      if (geoRes.ok) {
        const geoData = await geoRes.json() as { features?: { center: [number, number] }[] };
        const center = geoData.features?.[0]?.center;
        if (center) { centerLng = center[0]; centerLat = center[1]; }
      }
    } catch {}
  }

  // ── Load latest snapshot date for this business ───────────────────────────
  let keyword      = "";
  let snapshotDate = "";
  let heatmapPoints: HeatmapPoint[] = [];
  let isMock = false;

  if (biz) {
    // Find the most recent snapshot date
    const { data: latest } = await supabase
      .from("rank_snapshots")
      .select("keyword, snapshot_date, is_mock")
      .eq("business_id", biz.id)
      .order("snapshot_date", { ascending: false })
      .limit(1)
      .single();

    if (latest) {
      keyword      = latest.keyword;
      snapshotDate = latest.snapshot_date;
      isMock       = latest.is_mock ?? false;

      const [{ data: currentRows }, { data: prevLatest }] = await Promise.all([
        supabase
          .from("rank_snapshots")
          .select("lat, lng, rank_position")
          .eq("business_id", biz.id)
          .eq("keyword", keyword)
          .eq("snapshot_date", snapshotDate),
        supabase
          .from("rank_snapshots")
          .select("snapshot_date")
          .eq("business_id", biz.id)
          .eq("keyword", keyword)
          .lt("snapshot_date", snapshotDate)
          .order("snapshot_date", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      // Build a lookup of previous ranks by "lat,lng"
      const prevMap = new Map<string, number | null>();
      if (prevLatest) {
        const { data: prevRows } = await supabase
          .from("rank_snapshots")
          .select("lat, lng, rank_position")
          .eq("business_id", biz.id)
          .eq("keyword", keyword)
          .eq("snapshot_date", prevLatest.snapshot_date);

        for (const r of prevRows ?? []) {
          prevMap.set(`${r.lat},${r.lng}`, r.rank_position);
        }
      }

      heatmapPoints = (currentRows ?? []).map((r) => ({
        lat:           Number(r.lat),
        lng:           Number(r.lng),
        rank_position: r.rank_position,
        prev_rank:     prevMap.get(`${r.lat},${r.lng}`),
      }));
    }
  }

  return (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[700px] h-[400px] bg-zinc-700/8 rounded-full blur-[140px]" />
      </div>

      <main className="relative max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2">
            Local SEO
          </p>
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
            Local Rank Tracker
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500 max-w-xl leading-relaxed">
            Visualise where your business ranks across a 5×5 grid of map positions around
            your service area. Green = top 3, yellow = top 10, red = ranked but falling.
          </p>
        </div>

        {/* No businesses state */}
        {!biz ? (
          <div className="rounded-2xl border border-dashed border-white/[0.07] bg-white/[0.01] px-6 py-14 text-center">
            <p className="text-sm text-zinc-500 mb-1">No businesses added yet.</p>
            <p className="text-xs text-zinc-700">
              <a href="/dashboard" className="underline hover:text-zinc-500 transition-colors">
                Add a business
              </a>{" "}
              first, then come back to run a rank snapshot.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Business switcher (only if 2+ businesses) */}
            <BusinessSwitcher businesses={businesses ?? []} selectedId={biz.id} />

            {/* Business label */}
            <div className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.07] bg-white/[0.02]">
              <div>
                <p className="text-sm font-semibold text-zinc-200">{biz.business_name}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{biz.service_location}</p>
              </div>
            </div>

            <RankMapLoader
              keyword={keyword}
              snapshotDate={snapshotDate}
              points={heatmapPoints}
              businessId={biz.id}
              centerLat={centerLat}
              centerLng={centerLng}
              isMock={isMock}
              gbpConnected={gbpConnected}
            />

          </div>
        )}
      </main>
    </>
  );
}
