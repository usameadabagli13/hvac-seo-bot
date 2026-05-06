"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, Mail, Sparkles } from "lucide-react";

interface SpotStatus {
  total:     number;
  claimed:   number;
  remaining: number;
}

export default function WaitlistForm() {
  const [email,   setEmail]   = useState("");
  const [name,    setName]    = useState("");
  const [busy,    setBusy]    = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [done,    setDone]    = useState<{ founding: boolean } | null>(null);
  const [spots,   setSpots]   = useState<SpotStatus | null>(null);

  // Pull the current founding-spot count on mount
  useEffect(() => {
    let cancelled = false;
    fetch("/api/waitlist")
      .then((r) => r.json())
      .then((d: SpotStatus) => { if (!cancelled) setSpots(d); })
      .catch(() => { /* silent */ });
    return () => { cancelled = true; };
  }, []);

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
      const data = await res.json() as { ok?: boolean; founding?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setDone({ founding: !!data.founding });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className={`rounded-2xl px-6 py-5 flex items-start gap-3 ${
        done.founding
          ? "border border-amber-500/25 bg-amber-500/[0.05]"
          : "border border-emerald-500/20 bg-emerald-500/[0.05]"
      }`}>
        {done.founding
          ? <Sparkles      className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          : <CheckCircle2  className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />}
        <div>
          <p className={`text-sm font-semibold ${done.founding ? "text-amber-300" : "text-emerald-300"}`}>
            {done.founding ? "★ You're a founding member" : "You're on the list"}
          </p>
          <p className={`text-xs mt-0.5 ${done.founding ? "text-amber-400/80" : "text-emerald-400/70"}`}>
            {done.founding
              ? "Check your inbox — your founder discount code is locked in for life."
              : "Watch your inbox for product updates and HVAC SEO playbooks."}
          </p>
        </div>
      </div>
    );
  }

  const foundingActive = spots && spots.remaining > 0;
  const noSpotsLeft    = spots && spots.remaining === 0;

  return (
    <div className="space-y-3">
      {/* Spots counter */}
      {foundingActive && (
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400">
            <Sparkles className="w-3 h-3" />
            Founding Member
          </span>
          <span className="text-zinc-500">
            {spots.remaining} of {spots.total} spots left · 30% off forever
          </span>
        </div>
      )}
      {noSpotsLeft && (
        <p className="text-[11px] text-zinc-600">
          Founding spots are full — but the email list is still open for product updates.
        </p>
      )}

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
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm active:scale-[0.97] transition-all disabled:opacity-50 ${
              foundingActive
                ? "bg-amber-400 text-zinc-950 hover:bg-amber-300"
                : "bg-white text-zinc-950 hover:bg-zinc-100"
            }`}
          >
            {busy
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : foundingActive ? <Sparkles className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
            {busy ? "Joining…" : foundingActive ? "Claim my spot" : "Join the list"}
          </button>
        </div>
        {error && <p className="text-xs text-rose-400">{error}</p>}
        <p className="text-[11px] text-zinc-600">
          Or skip the wait —{" "}
          <a href="/login" className="underline hover:text-zinc-400">start a free 14-day trial</a>{" "}
          and use the product right now.
        </p>
      </form>
    </div>
  );
}
