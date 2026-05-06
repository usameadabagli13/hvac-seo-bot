"use client";

import { useState } from "react";
import { Loader2, Send, CheckCircle2, XCircle, Sparkles, Mail, Clock } from "lucide-react";

interface Result {
  ok:       boolean;
  message:  string;
  sentTo:   string;
  purpose:  string;
  template: string;
}

type Template = "simple" | "founding" | "newsletter" | "trial";
type Purpose  = "trial"  | "waitlist";

interface Action {
  id:       string;
  label:    string;
  template: Template;
  purpose:  Purpose;
  Icon:     typeof Send;
  variant:  "neutral" | "amber" | "emerald";
}

const ACTIONS: Action[] = [
  { id: "trial-creds",  label: "Test trial creds",     template: "simple",     purpose: "trial",    Icon: Send,     variant: "neutral" },
  { id: "wait-creds",   label: "Test waitlist creds",  template: "simple",     purpose: "waitlist", Icon: Send,     variant: "amber"   },
  { id: "founding",     label: "Preview: founding welcome",  template: "founding",   purpose: "waitlist", Icon: Sparkles, variant: "amber"   },
  { id: "newsletter",   label: "Preview: newsletter welcome", template: "newsletter", purpose: "waitlist", Icon: Mail,    variant: "neutral" },
  { id: "trial-ending", label: "Preview: trial ending email", template: "trial",      purpose: "trial",    Icon: Clock,   variant: "emerald" },
];

const VARIANT_CLASS: Record<Action["variant"], string> = {
  neutral:  "bg-white/[0.05] border-white/[0.10] text-zinc-200 hover:bg-white/[0.10] hover:border-white/[0.18]",
  amber:    "bg-amber-500/10 border-amber-500/25 text-amber-300 hover:bg-amber-500/15 hover:border-amber-500/40",
  emerald:  "bg-emerald-500/10 border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/15 hover:border-emerald-500/40",
};

export default function TestEmailButtons() {
  const [busy,    setBusy]   = useState<string | null>(null);
  const [result,  setResult] = useState<Result | null>(null);

  const send = async (action: Action) => {
    setBusy(action.id);
    setResult(null);
    try {
      const res = await fetch("/api/admin/test-email", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ purpose: action.purpose, template: action.template }),
      });
      const data = await res.json() as Result;
      setResult(data);
    } catch {
      setResult({ ok: false, message: "Network error.", sentTo: "—", purpose: action.purpose, template: action.template });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
        Test &amp; preview emails
      </p>
      <p className="text-[11px] text-zinc-600">
        Sends to your own address. Diagnostic tests verify Resend credentials; previews
        render the real production templates so you can see exactly what users receive.
      </p>
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => send(action)}
            disabled={busy !== null}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all disabled:opacity-50 ${VARIANT_CLASS[action.variant]}`}
          >
            {busy === action.id
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <action.Icon className="w-3.5 h-3.5" />}
            {action.label}
          </button>
        ))}
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
              {result.template} via {result.purpose} → {result.sentTo}
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
