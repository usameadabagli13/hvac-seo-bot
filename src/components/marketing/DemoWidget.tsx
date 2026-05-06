"use client";

import { useState } from "react";
import { Sparkles, Loader2, ChevronRight } from "lucide-react";

export default function DemoWidget() {
  const [city, setCity] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCity, setLastCity] = useState<string | null>(null);

  const handleGenerate = async () => {
    const trimmed = city.trim();
    if (!trimmed || loading || streaming) return;
    setError(null);
    setLoading(true);
    setStreaming(false);
    setKeywords([]);

    try {
      const res = await fetch("/api/demo-keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: trimmed }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Failed to generate keywords.");
      }

      setLastCity(trimmed);
      setLoading(false);
      setStreaming(true);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const kw = line.trim();
          if (kw) setKeywords((prev) => [...prev, kw]);
        }
      }
      if (buffer.trim()) setKeywords((prev) => [...prev, buffer.trim()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    } finally {
      setStreaming(false);
    }
  };

  const busy = loading || streaming;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
      <div className="flex gap-3">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          placeholder="Enter your city, e.g. Austin, TX"
          className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all duration-200"
        />
        <button
          onClick={handleGenerate}
          disabled={busy || !city.trim()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100 active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none shadow-lg shadow-black/20 flex-shrink-0"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate
            </>
          )}
        </button>
      </div>

      {!busy && !keywords.length && !error && (
        <p className="mt-3 text-xs text-zinc-700 text-center">
          Try: &ldquo;Dallas, TX&rdquo; · &ldquo;Phoenix, AZ&rdquo; · &ldquo;Chicago, IL&rdquo;
        </p>
      )}

      {error && (
        <p className="mt-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {keywords.length > 0 && lastCity && (
        <div className="mt-5">
          <p className="text-[11px] text-zinc-600 uppercase tracking-widest mb-3">
            AI-generated keywords for &ldquo;{lastCity}&rdquo;
          </p>
          <div className="flex flex-wrap gap-1.5">
            {keywords.map((kw, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2.5 py-1 rounded-lg bg-zinc-700/40 border border-zinc-600/30 text-xs text-zinc-300 animate-fade-in"
              >
                {kw}
              </span>
            ))}
            {streaming && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-zinc-800/40 border border-zinc-700/20">
                <Loader2 className="w-3 h-3 animate-spin text-zinc-600" />
              </span>
            )}
          </div>
          <div className="mt-5 pt-4 border-t border-white/[0.04] flex items-center justify-between">
            <p className="text-xs text-zinc-600">
              Want these for your actual business?
            </p>
            <a
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white font-medium transition-colors"
            >
              Sign up free
              <ChevronRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
