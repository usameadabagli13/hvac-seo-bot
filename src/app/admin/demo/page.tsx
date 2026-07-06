"use client";

import { useState, useCallback } from "react";
import RankHeatmap from "@/components/app/RankHeatmap";
import type { HeatmapPoint } from "@/components/app/RankHeatmap";
import { Zap, RefreshCw } from "lucide-react";

const LAT_SPACING = 0.0145;

const CITIES = [
  { label: "Dallas, TX",       lat: 32.7767,  lng: -96.7970  },
  { label: "Houston, TX",      lat: 29.7604,  lng: -95.3698  },
  { label: "Phoenix, AZ",      lat: 33.4484,  lng: -112.0740 },
  { label: "Atlanta, GA",      lat: 33.7490,  lng: -84.3880  },
  { label: "Chicago, IL",      lat: 41.8781,  lng: -87.6298  },
  { label: "Miami, FL",        lat: 25.7617,  lng: -80.1918  },
  { label: "Denver, CO",       lat: 39.7392,  lng: -104.9903 },
  { label: "Las Vegas, NV",    lat: 36.1699,  lng: -115.1398 },
  { label: "Nashville, TN",    lat: 36.1627,  lng: -86.7816  },
  { label: "Charlotte, NC",    lat: 35.2271,  lng: -80.8431  },
  { label: "Tampa, FL",        lat: 27.9506,  lng: -82.4572  },
  { label: "Orlando, FL",      lat: 28.5383,  lng: -81.3792  },
  { label: "Austin, TX",       lat: 30.2672,  lng: -97.7431  },
  { label: "San Antonio, TX",  lat: 29.4241,  lng: -98.4936  },
  { label: "Sacramento, CA",   lat: 38.5816,  lng: -121.4944 },
  { label: "Seattle, WA",      lat: 47.6062,  lng: -122.3321 },
  { label: "Minneapolis, MN",  lat: 44.9778,  lng: -93.2650  },
  { label: "Kansas City, MO",  lat: 39.0997,  lng: -94.5786  },
  { label: "Columbus, OH",     lat: 39.9612,  lng: -82.9988  },
  { label: "Indianapolis, IN", lat: 39.7684,  lng: -86.1581  },
];

const KEYWORD_SUGGESTIONS = [
  "AC repair near me",
  "HVAC contractor near me",
  "air conditioning repair",
  "furnace repair near me",
  "heat pump installation",
  "emergency HVAC service",
  "AC installation near me",
  "heating and cooling near me",
  "AC tune up near me",
  "ductwork repair near me",
];

type Pattern = "bad" | "mixed" | "good";

// Simple LCG PRNG so same seed → same output
function makePrng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(s, 1664525) + 1013904223 >>> 0;
    return s / 0x100000000;
  };
}

function generateGrid(
  centerLat: number,
  centerLng: number,
  pattern: Pattern,
  seed: number,
): HeatmapPoint[] {
  const rand = makePrng(seed);
  const lngSpacing = LAT_SPACING / Math.cos((centerLat * Math.PI) / 180);
  const points: HeatmapPoint[] = [];

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const lat  = centerLat + (2 - row) * LAT_SPACING;
      const lng  = centerLng + (col - 2) * lngSpacing;
      const dist = Math.sqrt((row - 2) ** 2 + (col - 2) ** 2);

      let rank_position: number | null;
      let prev_rank: number | null = null;

      if (pattern === "good") {
        if (dist === 0) {
          rank_position = 1;
          prev_rank = 3;
        } else if (dist <= 1) {
          rank_position = Math.floor(rand() * 4) + 2;           // 2–5
          prev_rank = rank_position + Math.floor(rand() * 3) + 1;
        } else if (dist <= Math.SQRT2) {
          rank_position = Math.floor(rand() * 6) + 4;           // 4–9
          prev_rank = rank_position + Math.floor(rand() * 4) + 1;
        } else if (dist <= 2) {
          rank_position = rand() < 0.2 ? null : Math.floor(rand() * 8) + 6; // 6–13
          prev_rank = rank_position !== null ? rank_position + Math.floor(rand() * 3) + 1 : null;
        } else {
          rank_position = rand() < 0.4 ? null : Math.floor(rand() * 10) + 9; // 9–18
          prev_rank = rank_position !== null ? rank_position + Math.floor(rand() * 4) + 2 : null;
        }
      } else if (pattern === "mixed") {
        if (dist === 0) {
          rank_position = Math.floor(rand() * 5) + 3;           // 3–7
          prev_rank = rank_position + Math.floor(rand() * 4) + 2;
        } else if (dist <= 1.5) {
          rank_position = rand() < 0.15 ? null : Math.floor(rand() * 12) + 4; // 4–15
          prev_rank = rank_position !== null ? rank_position + Math.floor(rand() * 5) - 2 : null;
        } else {
          rank_position = rand() < 0.45 ? null : Math.floor(rand() * 14) + 7; // 7–20
          prev_rank = rank_position !== null ? rank_position + Math.floor(rand() * 5) - 1 : null;
        }
      } else {
        // bad — prospect's current situation
        if (dist === 0) {
          rank_position = Math.floor(rand() * 8) + 11;          // 11–18
          prev_rank = rank_position - Math.floor(rand() * 2);   // slightly worse before
        } else {
          rank_position = rand() < 0.55 ? null : Math.floor(rand() * 12) + 14; // 14–25
          prev_rank = rank_position !== null ? rank_position - Math.floor(rand() * 3) : null;
        }
      }

      // Cap prev_rank to valid range
      if (prev_rank !== null && prev_rank < 1) prev_rank = null;

      points.push({
        lat,
        lng,
        rank_position,
        prev_rank: prev_rank ?? undefined,
      });
    }
  }

  return points;
}

export default function AdminDemoPage() {
  const [cityIndex,    setCityIndex]    = useState(0);
  const [keyword,      setKeyword]      = useState("AC repair near me");
  const [pattern,      setPattern]      = useState<Pattern>("bad");
  const [businessName, setBusinessName] = useState("");
  const [seed,         setSeed]         = useState(1337);

  const [result, setResult] = useState<{
    points:       HeatmapPoint[];
    keyword:      string;
    date:         string;
    city:         string;
    businessName: string;
  } | null>(null);

  const generate = useCallback((overrideSeed?: number) => {
    const s    = overrideSeed ?? seed;
    const city = CITIES[cityIndex];
    setResult({
      points:       generateGrid(city.lat, city.lng, pattern, s),
      keyword:      keyword.trim() || "HVAC near me",
      date:         new Date().toISOString().split("T")[0],
      city:         city.label,
      businessName: businessName.trim() || "Your HVAC Business",
    });
    if (overrideSeed !== undefined) setSeed(overrideSeed);
  }, [cityIndex, keyword, pattern, businessName, seed]);

  const reroll = () => generate(Date.now() & 0xffff);

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-1">Admin Tool</p>
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Demo Heatmap Generator</h1>
        <p className="mt-1 text-sm text-zinc-500 max-w-xl leading-relaxed">
          GBP veya kredi gerekmez. Müşteri adaylarına göstermek için herhangi bir şehir ve keyword için heatmap üret, ekran görüntüsü al.
        </p>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 space-y-4 mb-8">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Business name (sadece gösterim)</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="ör. Arctic Cool HVAC"
              className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-white/[0.08] text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">City</label>
            <select
              value={cityIndex}
              onChange={(e) => setCityIndex(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-white/[0.08] text-sm text-zinc-100 focus:outline-none focus:border-white/20 transition-colors"
            >
              {CITIES.map((c, i) => (
                <option key={c.label} value={i}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-zinc-500 mb-1.5">Keyword</label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="AC repair near me"
            list="kw-suggestions"
            className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-white/[0.08] text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-colors"
          />
          <datalist id="kw-suggestions">
            {KEYWORD_SUGGESTIONS.map((kw) => <option key={kw} value={kw} />)}
          </datalist>
        </div>

        <div>
          <label className="block text-xs text-zinc-500 mb-2">Ranking pattern</label>
          <div className="grid grid-cols-3 gap-2">
            {(["bad", "mixed", "good"] as Pattern[]).map((p) => (
              <button
                key={p}
                onClick={() => setPattern(p)}
                className={`h-10 rounded-lg text-xs font-semibold border transition-all ${
                  pattern === p
                    ? p === "good"
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                      : p === "mixed"
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                      : "bg-rose-500/20 border-rose-500/40 text-rose-300"
                    : "bg-zinc-900 border-white/[0.08] text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {p === "bad" ? "🔴 Struggling" : p === "mixed" ? "🟡 Mixed" : "🟢 Dominating"}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-zinc-600 mt-1.5">
            {pattern === "bad"
              ? "Prospect'in şu anki durumunu gösterir — satış konuşması için en etkili başlangıç"
              : pattern === "mixed"
              ? "Potansiyeli var ama boşluklar var — gelişim alanını netleştirmek için"
              : "HeatRank sonrası durumu gösterir — before/after karşılaştırması için"}
          </p>
        </div>

        <button
          onClick={() => generate()}
          className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-zinc-950 text-sm font-bold transition-all flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Generate Heatmap
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-200">
                {result.businessName}
                <span className="text-zinc-500 font-normal ml-2">— {result.city}</span>
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Keyword: <span className="text-zinc-300">{result.keyword}</span>
                <span className="text-zinc-700 ml-2">· {result.date}</span>
              </p>
            </div>
            <button
              onClick={reroll}
              title="Aynı ayarlarla farklı sonuç üret"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] text-xs text-zinc-400 hover:text-zinc-200 hover:border-white/[0.14] transition-all"
            >
              <RefreshCw className="w-3 h-3" />
              Re-roll
            </button>
          </div>

          <RankHeatmap
            keyword={result.keyword}
            snapshotDate={result.date}
            points={result.points}
            businessId="demo"
          />

          <p className="text-[11px] text-zinc-700 text-center pt-2">
            Admin-only · Bu veriler gerçek değil — yalnızca satış gösterimi içindir
          </p>
        </div>
      )}
    </main>
  );
}
