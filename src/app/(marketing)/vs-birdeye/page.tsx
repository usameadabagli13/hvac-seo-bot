import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Check, X, ChevronRight, DollarSign, Zap, Wrench, Building2 } from "lucide-react";

export const metadata: Metadata = {
  title:       "HeatRank AI vs Birdeye for HVAC | Cheaper, Specialized",
  description: "HeatRank AI vs Birdeye for HVAC contractors. Built specifically for HVAC, no annual contract, ~85% cheaper.",
  alternates:  { canonical: "/vs-birdeye" },
  openGraph: {
    title:       "HeatRank AI vs Birdeye",
    description: "HVAC-specific local SEO at a fraction of Birdeye's price.",
    url:         "/vs-birdeye",
    type:        "website",
  },
};

const ROWS = [
  { label: "Starting price",                 heatrank: "$39/mo",       birdeye: "$299+/mo (annual)", better: "heatrank" },
  { label: "Built specifically for HVAC",    heatrank: true,            birdeye: false,                better: "heatrank" },
  { label: "AI keyword research",            heatrank: true,            birdeye: false,                better: "heatrank" },
  { label: "Rank heatmap",                   heatrank: true,            birdeye: false,                better: "heatrank" },
  { label: "On-page SEO audit",              heatrank: true,            birdeye: false,                better: "heatrank" },
  { label: "AI review replies",              heatrank: true,            birdeye: true,                 better: null      },
  { label: "Review management",              heatrank: true,            birdeye: true,                 better: null      },
  { label: "Survey tools",                   heatrank: false,           birdeye: true,                 better: "birdeye" },
  { label: "Webchat / messaging",            heatrank: false,           birdeye: true,                 better: "birdeye" },
  { label: "Listings management (50+)",      heatrank: "core directories only", birdeye: true,         better: "birdeye" },
  { label: "Free trial",                     heatrank: "14 days",       birdeye: "Demo only",          better: "heatrank" },
  { label: "Annual contract required",       heatrank: false,           birdeye: true,                 better: "heatrank" },
];

const HIGHLIGHTS = [
  { icon: DollarSign, title: "$260+ saved monthly",    desc: "Birdeye starts at $299/month with annual contracts. HeatRank is $39." },
  { icon: Wrench,     title: "HVAC-specific keywords", desc: "Birdeye is industry-agnostic. Our keyword AI is trained on HVAC search patterns." },
  { icon: Zap,        title: "No demo, no contract",   desc: "Try HeatRank yourself in 3 minutes. Birdeye gates everything behind a sales call." },
  { icon: Building2,  title: "One industry, done well", desc: "Birdeye serves 200+ industries broadly. We picked HVAC and went deep." },
];

function Cell({ value }: { value: string | boolean }) {
  if (value === true)  return <Check className="w-4 h-4 text-emerald-400" />;
  if (value === false) return <X className="w-4 h-4 text-zinc-700" />;
  return <span className="text-xs text-zinc-300 text-center px-2">{value}</span>;
}

export default function VsBirdeyePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/heatrank-logo.png" alt="HeatRank AI" width={32} height={32} className="rounded-xl w-8 h-8" priority />
            <span className="text-base font-semibold tracking-tight">
              <span className="text-zinc-100">HeatRank</span>
              <span className="text-zinc-400"> AI</span>
            </span>
          </Link>
          <Link href="/login" className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100 transition-all">
            Start free <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6">
        <section className="pt-16 pb-12 text-center">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">HeatRank AI vs Birdeye</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-100 mb-5 leading-tight">
            HVAC-tuned for{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">$260 less per month</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Birdeye is solid if you need a mega-suite for surveys, listings, and webchat across multiple business types.
            HeatRank is better if you&apos;re an HVAC owner who wants to rank on Google without a $299/month bill or annual lock-in.
          </p>
        </section>

        <section className="py-8 border-t border-white/[0.06]">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-100 mb-1">{title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">Side-by-side comparison</h2>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
            <div className="grid grid-cols-[1.5fr_1fr_1fr] sm:grid-cols-[2fr_1fr_1fr] border-b border-white/[0.06] bg-white/[0.02]">
              <div className="px-4 py-3" />
              <div className="px-4 py-3 text-center">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> HeatRank AI
                </span>
              </div>
              <div className="px-4 py-3 text-center">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Birdeye</span>
              </div>
            </div>
            {ROWS.map((row, i) => (
              <div key={row.label} className={`grid grid-cols-[1.5fr_1fr_1fr] sm:grid-cols-[2fr_1fr_1fr] items-center ${i !== ROWS.length - 1 ? "border-b border-white/[0.04]" : ""}`}>
                <div className="px-4 py-3 text-sm text-zinc-300">{row.label}</div>
                <div className={`px-4 py-3 flex items-center justify-center ${row.better === "heatrank" ? "bg-emerald-500/[0.04]" : ""}`}>
                  <Cell value={row.heatrank} />
                </div>
                <div className={`px-4 py-3 flex items-center justify-center ${row.better === "birdeye" ? "bg-emerald-500/[0.04]" : ""}`}>
                  <Cell value={row.birdeye} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-zinc-700 mt-4 text-center max-w-2xl mx-auto">Based on Birdeye&apos;s 2025 public pricing. Highlighted cells show where each is stronger.</p>
        </section>

        <section className="py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 tracking-tight mb-3">Try it free for 14 days</h2>
          <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">No demo call. No annual lock-in. See your first keyword list in 30 seconds.</p>
          <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 transition-all shadow-lg">
            Start free trial <ChevronRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      <footer className="border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-zinc-700">© {new Date().getFullYear()} HeatRank AI</span>
          <div className="flex items-center gap-6 text-xs text-zinc-600">
            <Link href="/" className="hover:text-zinc-400">Home</Link>
            <Link href="/pricing" className="hover:text-zinc-400">Pricing</Link>
            <Link href="/vs-podium" className="hover:text-zinc-400">vs Podium</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
