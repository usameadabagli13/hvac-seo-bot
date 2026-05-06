"use client";

import { useState } from "react";
import { Loader2, Send, CheckCircle2, XCircle } from "lucide-react";

interface Result {
  ok:      boolean;
  message: string;
  sentTo:  string;
  purpose: string;
}

export default function TestEmailButtons() {
  const [busy,    setBusy]   = useState<string | null>(null);
  const [result,  setResult] = useState<Result | null>(null);

  const send = async (purpose: "trial" | "waitlist") => {
    setBusy(purpose);
    setResult(null);
    try {
      const res = await fetch("/api/admin/test-email", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ purpose }),
      });
      const data = await res.json() as Result;
      setResult(data);
    } catch {
      setResult({ ok: false, message: "Network error.", sentTo: "—", purpose });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
        Test email
      </p>
      <p className="text-[11px] text-zinc-600">
        Sends a one-line test to your own address using the requested credentials. Quickly verifies whether your Resend setup actually delivers.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => send("trial")}
          disabled={busy !== null}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.10] text-xs font-semibold text-zinc-200 hover:bg-white/[0.10] hover:border-white/[0.18] transition-all disabled:opacity-50"
        >
          {busy === "trial" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          Test trial creds
        </button>
        <button
          onClick={() => send("waitlist")}
          disabled={busy !== null}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs font-semibold text-amber-300 hover:bg-amber-500/15 hover:border-amber-500/40 transition-all disabled:opacity-50"
        >
          {busy === "waitlist" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          Test waitlist creds
        </button>
      </div>

      {result && (
        <div className={`rounded-xl border px-4 py-3 flex items-start gap-2.5 ${
          result.ok
            ? "border-emerald-500/25 bg-emerald-500/[0.05]"
            : "border-rose-500/25 bg-rose-500/[0.05]"
        }`}>
          {result.ok
            ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            : <XCircle      className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />}
          <div className="text-xs">
            <p className={`font-semibold ${result.ok ? "text-emerald-300" : "text-rose-300"}`}>
              {result.purpose} → {result.sentTo}
            </p>
            <p className={`mt-0.5 ${result.ok ? "text-emerald-400/80" : "text-rose-400/80"}`}>
              {result.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
