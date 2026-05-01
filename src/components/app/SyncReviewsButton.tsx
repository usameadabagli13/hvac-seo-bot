"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export default function SyncReviewsButton({
  businessId,
  lastFetchedAt,
}: {
  businessId?: string;
  lastFetchedAt?: string | null;
}) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{ upserted: number; total: number } | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setSyncError(null);
    setLastResult(null);
    try {
      const res = await fetch("/api/reviews/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(businessId ? { business_id: businessId } : {}),
      });
      const data = await res.json() as { upserted?: number; total?: number; error?: string };
      if (!res.ok) {
        setSyncError(data.error ?? "Sync failed.");
        return;
      }
      setLastResult({ upserted: data.upserted ?? 0, total: data.total ?? 0 });
      router.refresh();
    } catch {
      setSyncError("Network error — please try again.");
    } finally {
      setSyncing(false);
    }
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleSync}
        disabled={syncing}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:border-white/[0.14] hover:bg-white/[0.06] active:scale-[0.97] transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none"
      >
        <RefreshCw className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} />
        {syncing ? "Syncing…" : "Sync Reviews"}
      </button>

      {lastResult && (
        <p className="text-[11px] text-zinc-600">
          {lastResult.total === 0
            ? "No reviews found on GBP."
            : `Synced ${lastResult.total} review${lastResult.total !== 1 ? "s" : ""}`}
        </p>
      )}

      {syncError && (
        <p className="text-[11px] text-rose-500">{syncError}</p>
      )}

      {!lastResult && !syncError && lastFetchedAt && (
        <p className="text-[11px] text-zinc-700">Last synced {timeAgo(lastFetchedAt)}</p>
      )}
    </div>
  );
}
