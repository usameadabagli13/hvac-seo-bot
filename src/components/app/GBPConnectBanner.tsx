"use client";

import { useState } from "react";
import { CheckCircle2, Link2, Link2Off, Loader2 } from "lucide-react";

interface Props {
  isConnected: boolean;
  locationName: string | null;
  apiError: boolean;
}

export default function GBPConnectBanner({ isConnected, locationName, apiError }: Props) {
  const [disconnecting, setDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    if (!confirm("Disconnect Google Business Profile? Live review sync will stop.")) return;
    setDisconnecting(true);
    await fetch("/api/auth/gbp/disconnect", { method: "POST" });
    window.location.href = "/reviews";
  };

  if (isConnected && !apiError) {
    return (
      <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <p className="text-sm text-emerald-400">
            Connected to Google Business Profile
            {locationName && (
              <span className="ml-1.5 text-emerald-600 font-mono text-xs">
                {locationName}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleDisconnect}
          disabled={disconnecting}
          className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-rose-400 transition-colors duration-150 disabled:opacity-40"
        >
          {disconnecting ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Link2Off className="w-3 h-3" />
          )}
          Disconnect
        </button>
      </div>
    );
  }

  if (isConnected && apiError) {
    return (
      <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
        <p className="text-sm text-zinc-500">
          GBP connected but reviews could not be fetched.
        </p>
        <button
          onClick={handleDisconnect}
          disabled={disconnecting}
          className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-rose-400 transition-colors duration-150 disabled:opacity-40"
        >
          {disconnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Link2Off className="w-3 h-3" />}
          Disconnect &amp; retry
        </button>
      </div>
    );
  }

  // Not connected
  return (
    <div className="mb-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
        <Link2 className="w-4 h-4 text-zinc-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-200 mb-0.5">
          Connect Google Business Profile
        </p>
        <p className="text-xs text-zinc-500 leading-relaxed max-w-md">
          Authorize HeatRank AI to read your Google reviews. You&apos;ll be redirected to
          Google to approve access — no posting without your confirmation.
        </p>
      </div>
      <a
        href="/api/auth/gbp"
        className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100 active:scale-[0.98] transition-all duration-150 shadow-lg shadow-black/20"
      >
        <Link2 className="w-4 h-4" />
        Connect
      </a>
    </div>
  );
}
