"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import Map, { Source, Layer, Popup, NavigationControl } from "react-map-gl/mapbox";
import type { LayerProps, MapRef } from "react-map-gl/mapbox";
import type { MapMouseEvent } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, TrendingUp, TrendingDown, Minus, FlaskConical, Play } from "lucide-react";

export interface HeatmapPoint {
  lat:           number;
  lng:           number;
  rank_position: number | null;
  prev_rank?:    number | null;
}

interface Props {
  keyword:      string;
  snapshotDate: string;
  points:       HeatmapPoint[];
  businessId:   string;
  centerLat:    number;
  centerLng:    number;
  isMock:       boolean;
}

interface PopupInfo {
  lng:      number;
  lat:      number;
  rank:     number | null;
  prevRank: number | null;
}

// ── Layer specs ───────────────────────────────────────────────────────────────

const heatLayer: LayerProps = {
  id:   "rank-heat",
  type: "heatmap",
  paint: {
    "heatmap-weight": ["interpolate", ["linear"], ["get", "weight"], 0, 0, 1, 1],
    "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 9, 1, 13, 3],
    "heatmap-color": [
      "interpolate", ["linear"], ["heatmap-density"],
      0,    "rgba(0,0,0,0)",
      0.15, "rgba(244,63,94,0.5)",
      0.4,  "rgba(245,158,11,0.55)",
      0.72, "rgba(16,185,129,0.6)",
      1.0,  "rgba(52,211,153,0.8)",
    ],
    "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 9, 40, 13, 90],
    "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 11, 0.85, 14, 0.25],
  },
};

const circleLayer: LayerProps = {
  id:   "rank-circles",
  type: "circle",
  paint: {
    "circle-radius": ["interpolate", ["linear"], ["zoom"], 9, 12, 11, 20, 14, 36],
    "circle-color": [
      "case",
      ["!", ["get", "isRanked"]], "#27272a",
      ["<=", ["get", "rank"], 3],  "#10b981",
      ["<=", ["get", "rank"], 10], "#f59e0b",
      "#f43f5e",
    ],
    "circle-opacity": 0.82,
    "circle-stroke-width": 1.5,
    "circle-stroke-color": [
      "case",
      ["!", ["get", "isRanked"]], "#3f3f46",
      ["<=", ["get", "rank"], 3],  "#34d399",
      ["<=", ["get", "rank"], 10], "#fbbf24",
      "#fb7185",
    ],
    "circle-stroke-opacity": 1,
  },
};

const labelLayer: LayerProps = {
  id:   "rank-labels",
  type: "symbol",
  layout: {
    "text-field": [
      "case",
      ["!", ["get", "isRanked"]], "—",
      ["to-string", ["get", "rank"]],
    ],
    "text-size":             ["interpolate", ["linear"], ["zoom"], 9, 9, 12, 13],
    "text-font":             ["DIN Offc Pro Bold", "Arial Unicode MS Bold"],
    "text-allow-overlap":    true,
    "text-ignore-placement": true,
  },
  paint: {
    "text-color":       "#ffffff",
    "text-halo-color":  "rgba(0,0,0,0.55)",
    "text-halo-width":  1.2,
  },
};

// ── Main component ────────────────────────────────────────────────────────────

const KEYWORD_CHIPS = ["AC repair", "furnace install", "emergency HVAC", "ductwork", "heat pump"];

export default function RankMap({ keyword, snapshotDate, points, businessId, centerLat, centerLng, isMock }: Props) {
  const router  = useRouter();
  const mapRef  = useRef<MapRef>(null);
  const [popup,      setPopup]      = useState<PopupInfo | null>(null);
  const [cursor,     setCursor]     = useState("grab");
  const [seeding,    setSeeding]    = useState(false);
  const [seedMsg,    setSeedMsg]    = useState<string | null>(null);
  const [keywordVal, setKeywordVal] = useState(keyword);
  const [running,    setRunning]    = useState(false);
  const [runMsg,     setRunMsg]     = useState<string | null>(null);
  const [runError,   setRunError]   = useState<string | null>(null);

  // ── Stats ────────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const top3      = points.filter((p) => p.rank_position !== null && p.rank_position <= 3).length;
    const top10     = points.filter((p) => p.rank_position !== null && p.rank_position <= 10).length;
    const notRanked = points.filter((p) => p.rank_position === null).length;
    const ranked    = points.filter((p) => p.rank_position !== null);
    const avg       = ranked.length
      ? (ranked.reduce((s, p) => s + p.rank_position!, 0) / ranked.length).toFixed(1)
      : null;
    return { top3, top10, notRanked, avg };
  }, [points]);

  // ── GeoJSON source ───────────────────────────────────────────────────────────

  const geojson = useMemo<GeoJSON.FeatureCollection>(() => ({
    type: "FeatureCollection",
    features: points.map((p) => ({
      type:     "Feature",
      geometry: { type: "Point", coordinates: [p.lng, p.lat] },
      properties: {
        rank:     p.rank_position ?? 0,
        isRanked: p.rank_position !== null,
        prevRank: p.prev_rank ?? null,
        weight:   p.rank_position !== null
          ? Math.max(0, (21 - p.rank_position) / 20)
          : 0,
      },
    })),
  }), [points]);

  // ── Initial viewport ─────────────────────────────────────────────────────────

  const initialView = useMemo(() => {
    if (points.length) {
      const lat = points.reduce((s, p) => s + p.lat, 0) / points.length;
      const lng = points.reduce((s, p) => s + p.lng, 0) / points.length;
      return { latitude: lat, longitude: lng, zoom: 11 };
    }
    return { latitude: centerLat, longitude: centerLng, zoom: 11 };
  }, [points, centerLat, centerLng]);

  // ── Map interactions ─────────────────────────────────────────────────────────

  const handleClick = useCallback((e: MapMouseEvent) => {
    if (!mapRef.current) { setPopup(null); return; }
    const features = mapRef.current.queryRenderedFeatures(
      [e.point.x, e.point.y],
      { layers: ["rank-circles"] },
    );
    if (!features.length) { setPopup(null); return; }
    const f   = features[0];
    const geo = f.geometry as GeoJSON.Point;
    setPopup({
      lng:      geo.coordinates[0],
      lat:      geo.coordinates[1],
      rank:     f.properties?.isRanked ? (f.properties.rank as number) : null,
      prevRank: (f.properties?.prevRank as number | null) ?? null,
    });
  }, []);

  const handleMouseEnter = useCallback(() => setCursor("pointer"), []);
  const handleMouseLeave = useCallback(() => setCursor("grab"),    []);

  // ── Seed mock (dev only) ─────────────────────────────────────────────────────

  const handleSeedMock = async () => {
    setSeeding(true);
    setSeedMsg(null);
    try {
      const res  = await fetch("/api/rank/seed-mock", { method: "POST" });
      const data = await res.json() as { seeded?: number; business?: string; error?: string };
      if (!res.ok) { setSeedMsg(data.error ?? "Seed failed."); return; }
      setSeedMsg(`Seeded ${data.seeded} rows for "${data.business}".`);
      router.refresh();
    } catch {
      setSeedMsg("Network error.");
    } finally {
      setSeeding(false);
    }
  };

  // ── Run real snapshot ────────────────────────────────────────────────────────

  const handleRunSnapshot = async () => {
    if (!keywordVal.trim() || running) return;
    setRunning(true);
    setRunMsg(null);
    setRunError(null);
    try {
      const res  = await fetch("/api/rank/run-snapshot", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ business_id: businessId, keyword: keywordVal.trim() }),
      });
      const data = await res.json() as { ok?: boolean; points?: number; keyword?: string; error?: string };
      if (!res.ok) {
        setRunError(data.error ?? "Snapshot failed.");
        return;
      }
      setRunMsg(`Done — ${data.points} grid points scanned for "${data.keyword}".`);
      router.refresh();
    } catch {
      setRunError("Network error. Please try again.");
    } finally {
      setRunning(false);
    }
  };

  // ── (no early return — map renders even with empty points, overlay shows instead) ──

  // ── Popup helpers ────────────────────────────────────────────────────────────

  const rankColor = (r: number | null) =>
    r === null     ? "text-zinc-500"
    : r <= 3       ? "text-emerald-400"
    : r <= 10      ? "text-amber-400"
    : "text-rose-400";

  const rankTier = (r: number | null) =>
    r === null ? "Not ranked"
    : r <= 3   ? "Top 3"
    : r <= 10  ? "Top 10"
    : "Ranked";

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Test Mode badge — only when viewing mock/demo data */}
      {isMock && (
        <div className="flex items-center gap-2.5 rounded-xl border border-violet-500/25 bg-violet-500/[0.07] px-4 py-2.5">
          <FlaskConical className="h-4 w-4 flex-shrink-0 text-violet-400" />
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-violet-200">Test Mode</span>
            <span className="hidden sm:inline text-sm text-violet-300/70">
              {" "}· Try free — this is demo data, no credits are used.
            </span>
          </div>
          <span className="flex-shrink-0 rounded-full bg-violet-500/20 border border-violet-400/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-300">
            Demo
          </span>
        </div>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Top 3",      value: stats.top3,       color: "text-emerald-400" },
          { label: "Top 10",     value: stats.top10,      color: "text-amber-400"   },
          { label: "Not Ranked", value: stats.notRanked,  color: "text-zinc-500"    },
          { label: "Avg Rank",   value: stats.avg ?? "—", color: "text-zinc-300"    },
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

      {/* Keyword + date */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-600 uppercase tracking-widest">Keyword</p>
          <p className="text-xs text-zinc-600">{snapshotDate}</p>
        </div>
        <input
          type="text"
          value={keywordVal}
          onChange={(e) => setKeywordVal(e.target.value)}
          placeholder="e.g. AC repair"
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20"
        />
        <div className="flex flex-wrap gap-2">
          {KEYWORD_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setKeywordVal(chip)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-100 ${
                keywordVal === chip
                  ? "border-white/30 bg-white/10 text-zinc-100"
                  : "border-white/[0.08] bg-white/[0.02] text-zinc-500 hover:border-white/20 hover:text-zinc-300"
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Run Snapshot */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center gap-3">
            <button
              onClick={handleRunSnapshot}
              disabled={running || !keywordVal.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100 active:scale-[0.97] transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none"
            >
              {running
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Play className="w-4 h-4" />}
              {running ? "Scanning 25 grid points…" : "Run Snapshot"}
            </button>
            {runMsg && !running && (
              <p className="text-xs text-emerald-400">{runMsg}</p>
            )}
          </div>
          {runError && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
              {runError}
            </p>
          )}
          <p className="text-[11px] text-zinc-600 leading-relaxed">
            We match your business on Google Maps using its name and city.
            For best accuracy, make sure the business name here matches your
            Google Business Profile listing exactly. No credit is used if we
            can&apos;t find your listing or you don&apos;t rank in the top 20.
          </p>
        </div>
      </div>

      {/* Seed button (dev only, shown below map when empty) */}
      {points.length === 0 && process.env.NODE_ENV === "development" && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleSeedMock}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100 active:scale-[0.97] transition-all duration-150 disabled:opacity-50"
          >
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {seeding ? "Seeding…" : "Seed Mock Data"}
          </button>
          {seedMsg && <p className="text-xs text-zinc-500">{seedMsg}</p>}
        </div>
      )}

      {/* Map */}
      <div className="relative rounded-2xl overflow-hidden border border-white/[0.08]" style={{ height: 500 }}>
        {points.length === 0 && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/50 pointer-events-none">
            <p className="text-sm font-medium text-zinc-300">No rank data yet</p>
            <p className="text-xs text-zinc-500 max-w-[220px] text-center leading-relaxed">
              Run a snapshot to see rankings across your service area.
            </p>
          </div>
        )}
        {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? (
          <div className="h-full flex items-center justify-center bg-zinc-900">
            <p className="text-xs text-zinc-500 text-center max-w-xs">
              Add <code className="font-mono text-zinc-400">NEXT_PUBLIC_MAPBOX_TOKEN</code> to{" "}
              <code className="font-mono text-zinc-400">.env.local</code> to enable the map.
            </p>
          </div>
        ) : (
          <Map
            ref={mapRef}
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            initialViewState={initialView}
            style={{ width: "100%", height: "100%" }}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            interactiveLayerIds={["rank-circles"]}
            cursor={cursor}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <NavigationControl position="top-right" showCompass={false} />

            <Source id="rank-data" type="geojson" data={geojson}>
              <Layer {...heatLayer} />
              <Layer {...circleLayer} />
              <Layer {...labelLayer} />
            </Source>

            {popup && (
              <Popup
                longitude={popup.lng}
                latitude={popup.lat}
                anchor="bottom"
                offset={14}
                closeButton={false}
                onClose={() => setPopup(null)}
                className="rank-popup"
              >
                <div className="px-4 py-3 min-w-[130px]">
                  <div className="flex items-baseline gap-2 mb-1.5">
                    <span className={`text-3xl font-bold tabular-nums leading-none ${rankColor(popup.rank)}`}>
                      {popup.rank ?? "—"}
                    </span>
                    <span className="text-xs text-zinc-500 leading-tight">
                      {rankTier(popup.rank)}
                    </span>
                  </div>
                  {popup.rank !== null && popup.prevRank !== null && (() => {
                    const delta = popup.prevRank - popup.rank;
                    if (delta === 0) return (
                      <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                        <Minus className="w-3 h-3" />
                        <span>Unchanged (was #{popup.prevRank})</span>
                      </div>
                    );
                    if (delta > 0) return (
                      <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                        <TrendingUp className="w-3 h-3" />
                        <span>↑ {delta} spots (was #{popup.prevRank})</span>
                      </div>
                    );
                    return (
                      <div className="flex items-center gap-1 text-[11px] text-rose-400">
                        <TrendingDown className="w-3 h-3" />
                        <span>↓ {Math.abs(delta)} spots (was #{popup.prevRank})</span>
                      </div>
                    );
                  })()}
                </div>
              </Popup>
            )}
          </Map>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-zinc-600">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500/70 border border-emerald-400/60" />
          Rank 1–3
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-amber-500/70 border border-amber-400/60" />
          Rank 4–10
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-rose-500/70 border border-rose-400/60" />
          Rank 11+
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-zinc-700 border border-zinc-600" />
          Not ranked
        </div>
        <div className="flex items-center gap-1.5 ml-1">
          <TrendingUp className="w-3 h-3 text-emerald-400" />
          Improved
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingDown className="w-3 h-3 text-rose-400" />
          Declined
        </div>
        <span className="text-zinc-700 ml-1">· Click any point for details</span>
      </div>

    </div>
  );
}
