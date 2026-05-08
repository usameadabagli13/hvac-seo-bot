"use client";

import { useState } from "react";
import { Mail, Check, Loader2 } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (res.ok) {
        setStatus("ok");
        setEmail("");
      } else {
        setStatus("err");
      }
    } catch {
      setStatus("err");
    }
  };

  if (status === "ok") {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] px-5 py-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center flex-shrink-0">
          <Check className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-300 mb-1">You&apos;re in.</p>
          <p className="text-[11px] text-emerald-200/80 leading-relaxed">
            A welcome email is on its way from <span className="font-medium text-emerald-200">Usame at HeatRank AI</span>.
          </p>
          <p className="text-[11px] text-emerald-200/60 leading-relaxed mt-1.5">
            <span className="font-semibold">Don&apos;t see it?</span> Check your{" "}
            <span className="font-medium text-emerald-200">Promotions</span> tab (Gmail) or{" "}
            <span className="font-medium text-emerald-200">Junk</span> folder. Drag it to your inbox so you don&apos;t miss the weekly tip.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row items-stretch gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (status === "err") setStatus("idle"); }}
            placeholder="you@yourhvac.com"
            required
            disabled={status === "loading"}
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-zinc-900 border border-white/[0.08] text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10 disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={!email.trim() || status === "loading"}
          className="flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
        </button>
      </div>
      {status === "err" && (
        <p className="text-[11px] text-rose-400 mt-2">Couldn&apos;t subscribe. Try again or email us at support@heatrankai.com.</p>
      )}
      <p className="text-[11px] text-zinc-700 mt-2">One tip per week. Unsubscribe in one click.</p>
    </form>
  );
}
