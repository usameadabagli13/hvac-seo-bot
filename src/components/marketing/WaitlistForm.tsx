"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, Mail } from "lucide-react";

export default function WaitlistForm() {
  const [email,   setEmail]   = useState("");
  const [name,    setName]    = useState("");
  const [busy,    setBusy]    = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [done,    setDone]    = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || done) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, name, source: "landing" }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] px-6 py-5 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-emerald-300">You're on the list</p>
          <p className="text-xs text-emerald-400/70 mt-0.5">
            We'll email you when seats open. Check your inbox for the welcome message.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10"
          maxLength={80}
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@hvac.com"
          required
          className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10"
          maxLength={120}
        />
        <button
          type="submit"
          disabled={busy || !email.trim()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 active:scale-[0.97] transition-all disabled:opacity-50"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
          {busy ? "Joining…" : "Join waitlist"}
        </button>
      </div>
      {error && (
        <p className="text-xs text-rose-400">{error}</p>
      )}
      <p className="text-[11px] text-zinc-600">
        Or skip the wait —{" "}
        <a href="/login" className="underline hover:text-zinc-400">start a free 14-day trial</a>{" "}
        and use the product right now.
      </p>
    </form>
  );
}
