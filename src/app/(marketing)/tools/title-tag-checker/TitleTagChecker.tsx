"use client";

import { useState, useMemo } from "react";
import { Check, AlertTriangle, X } from "lucide-react";

const HVAC_TERMS = ["hvac","ac","air conditioning","heating","cooling","furnace","heat pump","duct","ventilation"];

export default function TitleTagChecker() {
  const [title, setTitle] = useState("");

  const analysis = useMemo(() => {
    const len = title.length;
    const lc = title.toLowerCase();
    const words = title.trim().split(/\s+/).filter(Boolean);
    const hasHvac = HVAC_TERMS.some((t) => lc.includes(t));
    const hasBrand = /\|\s*\S+/.test(title) || /—\s*\S+/.test(title);
    const titleCase = words.length > 0 && words.filter((w) => /^[A-Z]/.test(w)).length / words.length >= 0.6;

    const checks = [
      { id: "length",   ok: len >= 50 && len <= 60, warn: (len >= 30 && len < 50) || (len > 60 && len <= 70), label: "Length 50–60 characters", note: `${len} chars` },
      { id: "hvac",     ok: hasHvac,   warn: false, label: "Contains an HVAC keyword", note: hasHvac ? "✓ found" : "missing" },
      { id: "brand",    ok: hasBrand,  warn: false, label: "Ends with brand (| or —)", note: hasBrand ? "✓ found" : "add &ldquo;| YourBrand&rdquo;" },
      { id: "case",     ok: titleCase, warn: false, label: "Title Case capitalization", note: titleCase ? "✓ proper" : "mostly lowercase" },
      { id: "words",    ok: words.length >= 4 && words.length <= 10, warn: false, label: "4–10 words", note: `${words.length} words` },
    ];

    const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
    return { len, score, checks, words: words.length };
  }, [title]);

  const grade = analysis.score >= 80 ? "A" : analysis.score >= 60 ? "B" : analysis.score >= 40 ? "C" : "D";
  const gradeColor = analysis.score >= 80 ? "text-emerald-400" : analysis.score >= 60 ? "text-amber-400" : "text-rose-400";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/[0.10] bg-white/[0.02] p-6">
        <label htmlFor="title-input" className="block text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2">
          Your title tag
        </label>
        <input
          id="title-input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. AC Repair Dallas TX | 24/7 Emergency HVAC | Acme Cooling"
          className="w-full h-12 px-4 rounded-xl bg-zinc-900 border border-white/[0.08] text-base text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10"
          autoFocus
        />
        <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-600">
          <span className={analysis.len > 60 ? "text-rose-400" : analysis.len < 30 && analysis.len > 0 ? "text-amber-400" : "text-zinc-600"}>
            {analysis.len} / 60 chars
          </span>
          <span>{analysis.words} words</span>
        </div>
      </div>

      {title.trim() && (
        <>
          {/* Score */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 flex items-center gap-6">
            <div className={`text-5xl font-bold tabular-nums ${gradeColor}`}>{grade}</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-zinc-100 mb-1">Score: {analysis.score}/100</p>
              <p className="text-xs text-zinc-500">
                {analysis.score >= 80 ? "Excellent — this title is well optimized." :
                 analysis.score >= 60 ? "Decent. Fix the warnings below for a stronger score." :
                 "Needs work. Address the failed checks below."}
              </p>
            </div>
          </div>

          {/* SERP preview */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <p className="text-[11px] text-zinc-600 uppercase tracking-widest mb-3">Google preview</p>
            <div className="bg-white rounded-lg p-4">
              <p className="text-[14px] text-[#1a0dab] truncate font-normal hover:underline cursor-pointer">
                {title.length > 60 ? title.slice(0, 57) + "…" : title}
              </p>
              <p className="text-[12px] text-[#006621] mt-0.5">https://yourwebsite.com</p>
              <p className="text-[13px] text-[#545454] mt-1">Your meta description will appear here on Google&apos;s search results page...</p>
            </div>
          </div>

          {/* Checks */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-3">
            {analysis.checks.map((c) => (
              <div key={c.id} className="flex items-start gap-3">
                <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                  c.ok ? "bg-emerald-500/15 text-emerald-400" :
                  c.warn ? "bg-amber-500/15 text-amber-400" : "bg-rose-500/15 text-rose-400"
                }`}>
                  {c.ok ? <Check className="w-2.5 h-2.5" /> : c.warn ? <AlertTriangle className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                </div>
                <div className="flex-1 flex items-baseline justify-between gap-3 flex-wrap">
                  <span className="text-sm text-zinc-300">{c.label}</span>
                  <span className="text-xs text-zinc-600">{c.note}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
