"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface HeatmapPoint {
  lat:           number;
  lng:           number;
  rank_position: number | null;
  prev_rank?:    number | null; // same grid point from previous snapshot
}

interface Props {
  keyword:      string;
  snapshotDate: string;
  points:       HeatmapPoint[];
  businessId:   string;
}

// ── Colour helpers ────────────────────────────────────────────────────────────

function rankColor(rank: number | null): string {
  if (rank === null)  return "bg-zinc-800/60 border-white/[0.06] text-zinc-600";
  if (rank <= 3)      return "bg-emerald-500/20 border-emerald-500/30 text-emerald-300";
  if (rank <= 10)     return "bg-amber-500/20  border-amber-500/30  text-amber-300";
  return               "bg-rose-500/20   border-rose-500/30   text-rose-300";
}

function TrendIcon({ curr, prev }: { curr: number | null; prev?: number | null }) {
  if (curr === null || prev == null) return null;
  const delta = prev - curr; // positive = rank improved (number went down)
  if (delta === 0) return <Minus className="w-2.5 h-2.5 text-zinc-600" />;
  if (delta > 0)   return <TrendingUp   className="w-2.5 h-2.5 text-emerald-400" />;
  return                  <TrendingDown className="w-2.5 h-2.5 text-rose-400" />;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function RankHeatmap({ keyword, snapshotDate, points, businessId }: Props) {
  const router = useRouter();
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);

  // Build sorted unique lat/lng arrays to reconstruct the 2D grid
  const lats = [...new Set(points.map((p) => p.lat))].sort((a, b) => b - a); // N→S
  const lngs = [...new Set(points.map((p) => p.lng))].sort((a, b) => a - b); // W→E

  // Lookup map: "lat,lng" → point
  const lookup = new Map(points.map((p) => [`${p.lat},${p.lng}`, p]));

  const stats = {
    top3:      points.filter((p) => p.rank_position !== null && p.rank_position <= 3).length,
    top10:     points.filter((p) => p.rank_position !== null && p.rank_position <= 10).length,
    notRanked: points.filter((p) => p.rank_position === null).length,
    avg: (() => {
      const ranked = points.filter((p) => p.rank_position !== null);
      if (!ranked.length) return null;
      return (ranked.reduce((s, p) => s + p.rank_position!, 0) / ranked.length).toFixed(1);
    })(),
  };

  const handleSeedMock = async () => {
    setSeeding(true);
    setSeedMsg(null);
    try {
      const res = await fetch("/api/rank/seed-mock", { method: "POST" });
      const data = await res.json() as { seeded?: number; business?: string; error?: string };
      if (!res.ok) { setSeedMsg(data.error ?? "Seed failed."); return; }
      setSeedMsg(`Seeded ${data.seeded} snapshot rows for "${data.business}".`);
      router.refresh();
    } catch {
      setSeedMsg("Network error.");
    } finally {
      setSeeding(false);
    }
  };

  if (points.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/[0.07] bg-white/[0.01] px-6 py-14 flex flex-col items-center text-center gap-4">
        <p className="text-sm text-zinc-500">No rank data yet for this business.</p>
        <p className="text-xs text-zinc-700 max-w-xs leading-relaxed">
          In production, clicking &ldquo;Run Snapshot&rdquo; calls the Google Places API across 25 grid
          points. In development, seed mock data to preview the heatmap.
        </p>
        {process.env.NODE_ENV === "development" && (
          <button
            onClick={handleSeedMock}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100 active:scale-[0.97] transition-all duration-150 disabled:opacity-50"
          >
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {seeding ? "Seeding…" : "Seed Mock Data"}
          </button>
        )}
        {seedMsg && <p className="text-xs text-zinc-500">{seedMsg}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Top 3",       value: stats.top3,      color: "text-emerald-400" },
          { label: "Top 10",      value: stats.top10,     color: "text-amber-400"   },
          { label: "Not Ranked",  value: stats.notRanked, color: "text-zinc-500"    },
          { label: "Avg Rank",    value: stats.avg ?? "—", color: "text-zinc-300"   },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-center">
            <p className={`text-xl font-semibold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-zinc-600 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Keyword + date */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-600 uppercase tracking-widest mb-0.5">Keyword</p>
          <p className="text-sm font-semibold text-zinc-200">{keyword}</p>
        </div>
        <p className="text-xs text-zinc-600">{snapshotDate}</p>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div
          className="grid gap-1.5 min-w-fit mx-auto"
          style={{ gridTemplateColumns: `repeat(${lngs.length}, minmax(56px, 1fr))` }}
        >
          {lats.map((lat) =>
            lngs.map((lng) => {
              const point = lookup.get(`${lat},${lng}`);
              const rank  = point?.rank_position ?? null;
              const prev  = point?.prev_rank;

              return (
                <div
                  key={`${lat},${lng}`}
                  className={`relative flex flex-col items-center justify-center rounded-xl border h-14 w-14 transition-all duration-200 hover:scale-105 ${rankColor(rank)}`}
                  title={rank ? `Rank #${rank}${prev != null ? ` (was #${prev})` : ""}` : "Not ranked"}
                >
                  <span className="text-base font-bold tabular-nums leading-none">
                    {rank ?? "—"}
                  </span>
                  {/* Trend indicator */}
                  <div className="absolute bottom-1 right-1">
                    <TrendIcon curr={rank} prev={prev} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[11px] text-zinc-600">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-emerald-500/40 border border-emerald-500/40" />
          Rank 1–3
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-amber-500/40 border border-amber-500/40" />
          Rank 4–10
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-rose-500/40 border border-rose-500/40" />
          Rank 11+
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-zinc-800/60 border border-white/[0.06]" />
          Not ranked
        </div>
        <div className="flex items-center gap-1.5 ml-2">
          <TrendingUp className="w-3 h-3 text-emerald-400" />
          Improved
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingDown className="w-3 h-3 text-rose-400" />
          Declined
        </div>
      </div>
    </div>
  );
}
