"use client";

import { useState } from "react";
import { Link2, Check, Loader2, ExternalLink, Search } from "lucide-react";

const CITY_SUGGESTIONS = [
  "Dallas, TX", "Houston, TX", "San Antonio, TX", "Austin, TX",
  "Phoenix, AZ", "Tucson, AZ", "Las Vegas, NV",
  "Atlanta, GA", "Charlotte, NC", "Raleigh, NC",
  "Miami, FL", "Tampa, FL", "Orlando, FL", "Jacksonville, FL",
  "Chicago, IL", "Columbus, OH", "Indianapolis, IN", "Kansas City, MO",
  "Denver, CO", "Nashville, TN", "Memphis, TN",
  "Minneapolis, MN", "St. Louis, MO", "Louisville, KY",
  "Seattle, WA", "Portland, OR", "Sacramento, CA",
  "New York, NY", "Philadelphia, PA", "Baltimore, MD",
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

export default function AdminDemoPage() {
  const [bizName,   setBizName]   = useState("");
  const [city,      setCity]      = useState("");
  const [keyword,   setKeyword]   = useState("AC repair near me");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [result,    setResult]    = useState<{
    shareUrl: string;
    ranked:   number;
    total:    number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!bizName.trim() || !city.trim() || !keyword.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res  = await fetch("/api/admin/prospect-snapshot", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          business_name: bizName.trim(),
          city:          city.trim(),
          keyword:       keyword.trim(),
        }),
      });
      const data = await res.json() as {
        shareUrl?: string;
        ranked?:   number;
        total?:    number;
        error?:    string;
      };
      if (!res.ok) { setError(data.error ?? "Bir hata oluştu."); return; }
      setResult({ shareUrl: data.shareUrl!, ranked: data.ranked!, total: data.total! });
    } catch {
      setError("Ağ hatası. Tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">

      <div className="mb-8">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-1">Admin Aracı</p>
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Prospect Analizi</h1>
        <p className="mt-1.5 text-sm text-zinc-500 leading-relaxed max-w-lg">
          Potansiyel müşterinin işletme adı ve şehrini gir. Google&apos;dan gerçek rank verisi çekilir,
          paylaşılabilir bir link oluşturulur. Login gerektirmez — doğrudan at.
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 space-y-4">

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">
              İşletme adı <span className="text-zinc-700">(Google&apos;daki tam adı)</span>
            </label>
            <input
              type="text"
              value={bizName}
              onChange={(e) => setBizName(e.target.value)}
              placeholder="ör. Arctic Cool HVAC"
              className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-white/[0.08] text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Şehir</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="ör. Dallas, TX"
              list="city-list"
              className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-white/[0.08] text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-colors"
            />
            <datalist id="city-list">
              {CITY_SUGGESTIONS.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>
        </div>

        <div>
          <label className="block text-xs text-zinc-500 mb-1.5">Anahtar kelime</label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="AC repair near me"
            list="kw-list"
            className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-white/[0.08] text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-colors"
          />
          <datalist id="kw-list">
            {KEYWORD_SUGGESTIONS.map((kw) => <option key={kw} value={kw} />)}
          </datalist>
        </div>

        {error && (
          <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2.5">
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !bizName.trim() || !city.trim() || !keyword.trim()}
          className="w-full h-11 rounded-xl bg-white hover:bg-zinc-100 active:scale-[0.98] text-zinc-950 text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> 25 nokta taranıyor… (~30 sn)</>
            : <><Search className="w-4 h-4" /> Analiz Et &amp; Link Oluştur</>
          }
        </button>

        <p className="text-[11px] text-zinc-600">
          Google Places API — 25 sorgu · Tarama yaklaşık 20–40 saniye sürer
        </p>
      </div>

      {/* Result */}
      {result && (
        <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5 space-y-3.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
            <p className="text-sm font-semibold text-emerald-300">
              Analiz tamamlandı — {result.ranked}/{result.total} noktada sıralandı
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              readOnly
              value={result.shareUrl}
              className="flex-1 h-9 px-3 rounded-lg bg-zinc-900/60 border border-white/[0.08] text-xs text-zinc-300 font-mono focus:outline-none select-all"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              onClick={copyLink}
              className="h-9 px-3 rounded-lg border border-white/[0.08] text-xs font-semibold text-zinc-300 hover:text-zinc-100 hover:border-white/20 transition-all flex items-center gap-1.5 flex-shrink-0"
            >
              {copied
                ? <><Check className="w-3.5 h-3.5 text-emerald-400" /> Kopyalandı</>
                : <><Link2 className="w-3.5 h-3.5" /> Kopyala</>
              }
            </button>
            <a
              href={result.shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 px-3 rounded-lg border border-white/[0.08] text-xs font-semibold text-zinc-300 hover:text-zinc-100 hover:border-white/20 transition-all flex items-center gap-1.5 flex-shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Önizle
            </a>
          </div>

          <p className="text-[11px] text-zinc-600">
            Herkese açık, login gerektirmez. WhatsApp veya e-posta ile direkt at.
          </p>
        </div>
      )}
    </main>
  );
}
