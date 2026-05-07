"use client";

import { useState, useMemo } from "react";

const STOPWORDS = new Set([
  "the","a","an","and","or","but","of","in","on","at","to","for","with","by","is","are","was","were","be","been","being",
  "we","our","us","you","your","they","their","this","that","these","those","it","its","as","from","about","more","most",
  "i","me","my","he","she","his","her","them","than","then","so","not","no","do","does","did","have","has","had","can",
  "will","would","should","could","may","might","up","down","out","over","under","again","once","other","some","any","all",
  "if","when","where","why","how","what","which","who","whom","into","onto","upon","off","also","just","only","own","same",
  "very","too","each","every","both","few","many","much","such","one","two","three","first","second","new","old","good","best",
]);

const HVAC_FOCUS = [
  "ac repair",
  "air conditioning",
  "furnace repair",
  "heating",
  "hvac",
  "heat pump",
  "ductwork",
  "thermostat",
  "emergency",
  "tune-up",
  "installation",
];

interface PhraseStat {
  phrase: string;
  count:  number;
  density: number;
}

function analyze(text: string): { wordCount: number; unigrams: PhraseStat[]; bigrams: PhraseStat[]; missing: string[] } {
  const cleaned = text.toLowerCase().replace(/[^a-z0-9\s\-]/g, " ").replace(/\s+/g, " ").trim();
  const words   = cleaned ? cleaned.split(" ").filter(Boolean) : [];
  const total   = words.length;

  const unigramCount = new Map<string, number>();
  const bigramCount  = new Map<string, number>();

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (w.length >= 3 && !STOPWORDS.has(w)) {
      unigramCount.set(w, (unigramCount.get(w) ?? 0) + 1);
    }
    if (i < words.length - 1) {
      const next = words[i + 1];
      if (next.length >= 3 && !STOPWORDS.has(w) && !STOPWORDS.has(next)) {
        const bg = `${w} ${next}`;
        bigramCount.set(bg, (bigramCount.get(bg) ?? 0) + 1);
      }
    }
  }

  const toStats = (m: Map<string, number>): PhraseStat[] =>
    [...m.entries()]
      .filter(([, c]) => c >= 2)
      .map(([phrase, count]) => ({ phrase, count, density: (count / total) * 100 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);

  const lc = cleaned;
  const missing = HVAC_FOCUS.filter((kw) => !lc.includes(kw));

  return {
    wordCount: total,
    unigrams:  toStats(unigramCount),
    bigrams:   toStats(bigramCount),
    missing,
  };
}

export default function KeywordDensity() {
  const [text, setText] = useState("");
  const result = useMemo(() => analyze(text), [text]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/[0.10] bg-white/[0.02] p-6">
        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2">Paste your page copy</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder="Paste your homepage or service-page text here. Aim for at least 200 words for accurate analysis."
          className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/[0.08] text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-white/20 resize-none font-mono"
        />
        <div className="mt-2 text-[11px] text-zinc-600 flex justify-between">
          <span>{result.wordCount} words</span>
          <span>{text.length} chars</span>
        </div>
      </div>

      {result.wordCount > 30 && (
        <>
          {result.missing.length > 0 && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] p-5">
              <p className="text-xs font-semibold text-amber-300 uppercase tracking-widest mb-2">Missing HVAC keywords</p>
              <p className="text-xs text-amber-200/70 mb-3">These industry phrases never appear in your copy. Consider adding the relevant ones:</p>
              <div className="flex flex-wrap gap-1.5">
                {result.missing.map((m) => (
                  <span key={m} className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/15 text-[11px] font-medium text-amber-200">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Top single words</p>
              {result.unigrams.length === 0 ? (
                <p className="text-xs text-zinc-600">Not enough repeats yet.</p>
              ) : (
                <ul className="space-y-2">
                  {result.unigrams.map((s) => (
                    <li key={s.phrase} className="flex items-center justify-between text-sm">
                      <span className="text-zinc-200 truncate">{s.phrase}</span>
                      <span className="text-[11px] text-zinc-500 tabular-nums flex-shrink-0 ml-2">
                        {s.count}× · {s.density.toFixed(1)}%
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Top phrases (2-word)</p>
              {result.bigrams.length === 0 ? (
                <p className="text-xs text-zinc-600">Not enough repeats yet.</p>
              ) : (
                <ul className="space-y-2">
                  {result.bigrams.map((s) => (
                    <li key={s.phrase} className="flex items-center justify-between text-sm">
                      <span className="text-zinc-200 truncate">{s.phrase}</span>
                      <span className="text-[11px] text-zinc-500 tabular-nums flex-shrink-0 ml-2">
                        {s.count}× · {s.density.toFixed(1)}%
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
