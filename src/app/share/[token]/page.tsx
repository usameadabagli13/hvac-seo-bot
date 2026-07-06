import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, MapPin, Search } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import RankMapLoader from "@/components/app/RankMapLoader";
import type { HeatmapPoint } from "@/components/app/RankMap";

interface ProspectSnapshot {
  id:            string;
  token:         string;
  business_name: string;
  city:          string;
  keyword:       string;
  center_lat:    number;
  center_lng:    number;
  points:        HeatmapPoint[];
  created_at:    string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const supabase  = await createClient();
  const { data }  = await supabase
    .from("prospect_snapshots")
    .select("business_name, city, keyword")
    .eq("token", token)
    .maybeSingle();

  if (!data) return { title: "Rank Analysis | HeatRank AI" };

  return {
    title:       `${data.business_name} — Local Rank Analysis | HeatRank AI`,
    description: `See how ${data.business_name} ranks for "${data.keyword}" across ${data.city} on Google Maps.`,
    robots:      { index: false, follow: false },
  };
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase  = await createClient();

  const { data: snapshot } = await supabase
    .from("prospect_snapshots")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (!snapshot) notFound();

  const s      = snapshot as ProspectSnapshot;
  const points = s.points as HeatmapPoint[];
  const date   = new Date(s.created_at).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  const top3      = points.filter((p) => p.rank_position !== null && p.rank_position <= 3).length;
  const top10     = points.filter((p) => p.rank_position !== null && p.rank_position <= 10).length;
  const notRanked = points.filter((p) => p.rank_position === null).length;
  const ranked    = points.filter((p) => p.rank_position !== null);
  const avg       = ranked.length
    ? (ranked.reduce((sum, p) => sum + p.rank_position!, 0) / ranked.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-amber-500/[0.04] rounded-full blur-[160px]" />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/heatrank-logo.png"
              alt="HeatRank AI"
              width={28}
              height={28}
              className="rounded-xl w-7 h-7"
              priority
            />
            <span className="text-sm font-semibold tracking-tight">
              <span className="text-zinc-100">HeatRank</span>
              <span className="text-zinc-500"> AI</span>
            </span>
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100 transition-all"
          >
            Get my free analysis <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <main className="relative max-w-4xl mx-auto px-6 py-10">

        {/* Business + keyword header */}
        <div className="mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-300 flex-shrink-0 select-none">
              {s.business_name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-zinc-100 tracking-tight leading-tight">
                {s.business_name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <MapPin className="w-3.5 h-3.5" />
                  {s.city}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <Search className="w-3.5 h-3.5" />
                  {s.keyword}
                </span>
                <span className="text-xs text-zinc-700">Analyzed {date}</span>
              </div>
            </div>
          </div>

          <p className="mt-5 text-sm text-zinc-400 leading-relaxed max-w-2xl">
            This map shows where <span className="text-zinc-200 font-medium">{s.business_name}</span> appears in Google Maps search results for{" "}
            <span className="text-zinc-200 font-medium">&ldquo;{s.keyword}&rdquo;</span> across 25 locations in {s.city}.
            Green = top 3, yellow = top 10, red = ranked but low, grey = not found.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Top 3",      value: top3,       color: "text-emerald-400" },
            { label: "Top 10",     value: top10,      color: "text-amber-400"   },
            { label: "Not Ranked", value: notRanked,  color: "text-zinc-500"    },
            { label: "Avg Rank",   value: avg ?? "—", color: "text-zinc-300"    },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-center"
            >
              <p className={`text-xl font-semibold tabular-nums ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-zinc-600 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Interactive map */}
        <RankMapLoader
          keyword={s.keyword}
          snapshotDate={new Date(s.created_at).toISOString().split("T")[0]}
          points={points}
          businessId={s.id}
          centerLat={Number(s.center_lat)}
          centerLng={Number(s.center_lng)}
          isMock={false}
          gbpConnected={false}
          readOnly={true}
        />

        {/* CTA */}
        <div className="mt-12 rounded-3xl border border-white/[0.08] bg-white/[0.02] px-6 py-10 sm:px-10 text-center">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">
            Free analysis from HeatRank AI
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight mb-3 leading-tight">
            Want to rank higher across {s.city}?
          </h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed mb-6">
            HeatRank AI helps HVAC contractors dominate local Google search — no agency, no $2,000/mo bills.
            Start your free 14-day trial and see your own rank map in minutes.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 transition-all shadow-lg"
          >
            Start free — no credit card <ChevronRight className="w-4 h-4" />
          </Link>
          <p className="text-[11px] text-zinc-700 mt-4">
            14-day free trial · 30-day money-back guarantee · Cancel anytime
          </p>
        </div>

      </main>

      <footer className="relative border-t border-white/[0.06] mt-16">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <span className="text-xs text-zinc-700">© {new Date().getFullYear()} HeatRank AI</span>
          <Link href="/" className="text-xs text-zinc-700 hover:text-zinc-400 transition-colors">
            heatrankai.com
          </Link>
        </div>
      </footer>
    </div>
  );
}
