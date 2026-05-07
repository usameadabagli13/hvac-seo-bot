"use client";

import { useState } from "react";
import { Copy, Check, RefreshCw, Sparkles } from "lucide-react";

const SERVICES = [
  "AC repair",
  "Furnace repair",
  "Heat pump installation",
  "Air conditioning replacement",
  "Heating system tune-up",
  "Emergency HVAC service",
  "Ductwork repair",
  "Indoor air quality",
];

const TEMPLATES: ((s: string, c: string, b: string) => string)[] = [
  (s, c, b) =>
    `${s} in ${c}? ${b} offers same-day service, upfront pricing, and licensed technicians. Free quotes — call now or book online today.`,
  (s, c, b) =>
    `Need fast ${s.toLowerCase()} in ${c}? ${b} fixes it right the first time. 24/7 emergency service, certified techs, no hidden fees. Get a free estimate.`,
  (s, c, b) =>
    `${b}: ${c}'s trusted HVAC experts for ${s.toLowerCase()}. Licensed, insured, and family-owned. Fast response, flat-rate pricing. Schedule online today.`,
  (s, c, b) =>
    `Looking for ${s.toLowerCase()} near ${c}? ${b}'s certified HVAC pros deliver fast, honest service backed by a satisfaction guarantee. Call for a free quote.`,
  (s, c, b) =>
    `Beat the heat (or the cold) in ${c}. ${b} provides expert ${s.toLowerCase()} with same-day appointments and upfront pricing. Book online in 60 seconds.`,
];

export default function MetaDescriptionGenerator() {
  const [service, setService] = useState(SERVICES[0]);
  const [city, setCity] = useState("");
  const [brand, setBrand] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const generate = () => {
    if (!city.trim() || !brand.trim()) return;
    const shuffled = [...TEMPLATES].sort(() => Math.random() - 0.5).slice(0, 3);
    setResults(shuffled.map((fn) => fn(service, city.trim(), brand.trim())));
    setCopiedIdx(null);
  };

  const copy = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/[0.10] bg-white/[0.02] p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2">Service</label>
          <select
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="w-full h-11 px-3 rounded-xl bg-zinc-900 border border-white/[0.08] text-sm text-zinc-100 focus:outline-none focus:border-white/20"
          >
            {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2">City / Service Area</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Dallas, TX"
            className="w-full h-11 px-4 rounded-xl bg-zinc-900 border border-white/[0.08] text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-white/20"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2">Business Name</label>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Acme Cooling & Heating"
            className="w-full h-11 px-4 rounded-xl bg-zinc-900 border border-white/[0.08] text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-white/20"
          />
        </div>
        <button
          onClick={generate}
          disabled={!city.trim() || !brand.trim()}
          className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none"
        >
          {results.length > 0 ? <RefreshCw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          {results.length > 0 ? "Generate again" : "Generate 3 descriptions"}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((r, i) => {
            const len = r.length;
            const tooLong = len > 160;
            const tooShort = len < 120;
            return (
              <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <p className="text-sm text-zinc-200 leading-relaxed mb-3">{r}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] tabular-nums ${tooLong ? "text-rose-400" : tooShort ? "text-amber-400" : "text-emerald-400"}`}>
                    {len} chars
                    {tooLong ? " (will truncate)" : tooShort ? " (a bit short)" : " ✓"}
                  </span>
                  <button
                    onClick={() => copy(r, i)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.10] bg-white/[0.03] text-xs text-zinc-300 hover:bg-white/[0.06] transition-all"
                  >
                    {copiedIdx === i ? <><Check className="w-3 h-3 text-emerald-400" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
