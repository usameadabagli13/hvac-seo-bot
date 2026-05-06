"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ExternalLink, Plus, CheckCircle2, AlertTriangle, Trash2 } from "lucide-react";

interface Citation {
  id:               string;
  directory:        string;
  listing_url:      string;
  detected_name:    string | null;
  detected_address: string | null;
  detected_phone:   string | null;
  nap_consistent:   boolean;
  diff:             unknown;
  last_checked_at:  string;
}

interface Diff {
  canonical: string | null;
  detected:  string | null;
}

interface Props {
  businessId:      string;
  citations:       Citation[];
  consistentCount: number;
  napReady:        boolean;
}

function isDiff(x: unknown): x is Diff {
  return typeof x === "object" && x !== null && ("canonical" in x || "detected" in x);
}

export default function CitationsClient({ businessId, citations, consistentCount, napReady }: Props) {
  const router = useRouter();
  const [url,      setUrl]      = useState("");
  const [scanning, setScanning] = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || scanning) return;
    setScanning(true);
    setError(null);
    try {
      const res = await fetch("/api/citations/scan", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ business_id: businessId, listing_url: url.trim() }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Scan failed.");
        return;
      }
      setUrl("");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setScanning(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this citation from tracking?")) return;
    try {
      const res = await fetch(`/api/citations?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Score */}
      {citations.length > 0 && (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-4 flex items-center gap-4">
          <div className="text-3xl font-bold tabular-nums text-emerald-400">
            {consistentCount}
            <span className="text-zinc-700 font-normal text-xl">/{citations.length}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-zinc-200">
              {consistentCount === citations.length ? "All consistent ✓" : "Some inconsistencies found"}
            </p>
            <p className="text-[11px] text-zinc-600 mt-0.5">
              Across {citations.length} tracked director{citations.length === 1 ? "y" : "ies"}.
            </p>
          </div>
        </div>
      )}

      {/* Add citation */}
      <form onSubmit={handleScan} className="space-y-2">
        <p className="text-[11px] uppercase tracking-widest text-zinc-600">Add a directory listing</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.yelp.com/biz/your-listing"
            disabled={!napReady || scanning}
            required
            className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!napReady || scanning || !url.trim()}
            title={!napReady ? "Set canonical NAP on the business first" : "Uses 1 AI call to extract NAP"}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100 active:scale-[0.97] transition-all disabled:opacity-40"
          >
            {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {scanning ? "Scanning…" : "Scan listing"}
          </button>
        </div>
        {error && <p className="text-xs text-rose-400">{error}</p>}
        <p className="text-[11px] text-zinc-700">
          Paste any directory profile URL (Yelp, Angi, BBB, YellowPages, HomeAdvisor, etc.). We&apos;ll
          extract the NAP and compare it to your canonical fields.
        </p>
      </form>

      {/* Citations list */}
      {citations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.07] bg-white/[0.01] px-5 py-12 text-center">
          <p className="text-sm text-zinc-500 mb-1">No citations tracked yet</p>
          <p className="text-[11px] text-zinc-700 max-w-sm mx-auto leading-relaxed">
            Add your top 5-10 directory listings above. NAP consistency is one of the strongest local
            ranking signals.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-widest text-zinc-600">Tracked listings</p>
          {citations.map((c) => {
            const diff = (c.diff ?? {}) as Record<string, Diff>;
            const fields = Object.entries(diff).filter(([, v]) => isDiff(v)) as [string, Diff][];
            return (
              <div key={c.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {c.nap_consistent
                        ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" />
                            Consistent
                          </span>
                        )
                        : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-amber-500/25 bg-amber-500/10 text-amber-400 text-[10px] font-semibold uppercase tracking-wider">
                            <AlertTriangle className="w-3 h-3" />
                            Mismatch
                          </span>
                        )}
                      <span className="text-xs font-semibold text-zinc-300">{c.directory}</span>
                    </div>
                    <a
                      href={c.listing_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors truncate max-w-md"
                    >
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{c.listing_url}</span>
                    </a>
                  </div>
                  <button
                    onClick={() => handleDelete(c.id)}
                    title="Stop tracking"
                    className="text-zinc-700 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Diff details */}
                {fields.length > 0 && (
                  <div className="mt-3 space-y-2 pt-3 border-t border-white/[0.05]">
                    {fields.map(([field, vals]) => (
                      <div key={field} className="text-[11px]">
                        <p className="text-zinc-500 uppercase tracking-wide mb-1">{field}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="rounded-md bg-emerald-500/[0.05] border border-emerald-500/15 px-2 py-1.5">
                            <p className="text-emerald-500/70 text-[9px] uppercase tracking-wider mb-0.5">Yours</p>
                            <p className="text-zinc-300">{vals.canonical ?? "(none)"}</p>
                          </div>
                          <div className="rounded-md bg-rose-500/[0.05] border border-rose-500/15 px-2 py-1.5">
                            <p className="text-rose-400/70 text-[9px] uppercase tracking-wider mb-0.5">Listed</p>
                            <p className="text-zinc-300">{vals.detected ?? "(none)"}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-[10px] text-zinc-700 mt-3">
                  Last checked {new Date(c.last_checked_at).toLocaleDateString()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
