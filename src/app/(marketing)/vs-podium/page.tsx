import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Check, X, ChevronRight, DollarSign, Wrench, Zap, Building2 } from "lucide-react";

export const metadata: Metadata = {
  title:       "HeatRank AI vs Podium for HVAC | Cheaper, HVAC-Specific",
  description: "Comparing HeatRank AI to Podium for HVAC contractors. Save 80%+ on monthly cost and get HVAC-specific keyword research Podium doesn't offer.",
  alternates:  { canonical: "/vs-podium" },
  openGraph: {
    title:       "HeatRank AI vs Podium",
    description: "HVAC-specific local SEO at 1/5 the cost of Podium.",
    url:         "/vs-podium",
    type:        "website",
  },
};

const ROWS = [
  { label: "Starting price",                  heatrank: "$39/mo",        podium: "$249+/mo",        better: "heatrank" },
  { label: "Built specifically for HVAC",     heatrank: true,             podium: false,             better: "heatrank" },
  { label: "AI keyword research (HVAC)",      heatrank: true,             podium: false,             better: "heatrank" },
  { label: "Rank heatmap (5×5 grid)",         heatrank: true,             podium: false,             better: "heatrank" },
  { label: "On-page SEO audit",               heatrank: true,             podium: false,             better: "heatrank" },
  { label: "AI review replies",               heatrank: true,             podium: true,              better: null      },
  { label: "Review management",               heatrank: true,             podium: true,              better: null      },
  { label: "SMS/text marketing",              heatrank: false,            podium: true,              better: "podium"  },
  { label: "Webchat / website chat widget",   heatrank: false,            podium: true,              better: "podium"  },
  { label: "Payments / invoicing",            heatrank: false,            podium: true,              better: "podium"  },
  { label: "Setup time",                      heatrank: "3 minutes",      podium: "Days (sales call)", better: "heatrank" },
  { label: "Free trial",                      heatrank: "14 days",        podium: "No",              better: "heatrank" },
  { label: "Annual contract required",        heatrank: false,            podium: true,              better: "heatrank" },
];

const HIGHLIGHTS = [
  { icon: DollarSign, title: "$210+ saved monthly",  desc: "Podium starts at $249/month with annual contracts. HeatRank starts at $39." },
  { icon: Wrench,     title: "HVAC keyword research", desc: "Podium doesn't have this. We do — and it's tailored to your service area." },
  { icon: Zap,        title: "No sales call",         desc: "Podium requires a demo and a contract. Try HeatRank yourself in 3 minutes." },
  { icon: Building2,  title: "Built for HVAC only",   desc: "Podium serves 30+ industries. We picked one and built every feature around HVAC." },
];

function Cell({ value }: { value: string | boolean }) {
  if (value === true)  return <Check className="w-4 h-4 text-emerald-400" />;
  if (value === false) return <X className="w-4 h-4 text-zinc-700" />;
  return <span className="text-sm text-zinc-300">{value}</span>;
}

export default function VsPodiumPage() {
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
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">
            HeatRank AI vs Podium
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-100 mb-5 leading-tight">
            HVAC-specific tools at{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">
              1/5 the price
            </span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Podium is great if you need a full customer-comms platform across multiple industries.
            HeatRank is better if you&apos;re an HVAC contractor who wants to rank on Google — and not pay $249/month.
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
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
              Side-by-side comparison
            </h2>
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
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Podium</span>
              </div>
            </div>
            {ROWS.map((row, i) => (
              <div key={row.label} className={`grid grid-cols-[1.5fr_1fr_1fr] sm:grid-cols-[2fr_1fr_1fr] items-center ${i !== ROWS.length - 1 ? "border-b border-white/[0.04]" : ""}`}>
                <div className="px-4 py-3 text-sm text-zinc-300">{row.label}</div>
                <div className={`px-4 py-3 flex items-center justify-center ${row.better === "heatrank" ? "bg-emerald-500/[0.04]" : ""}`}>
                  <Cell value={row.heatrank} />
                </div>
                <div className={`px-4 py-3 flex items-center justify-center ${row.better === "podium" ? "bg-emerald-500/[0.04]" : ""}`}>
                  <Cell value={row.podium} />
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-zinc-700 mt-4 text-center max-w-2xl mx-auto leading-relaxed">
            Based on Podium&apos;s public pricing as of 2025. Highlighted cells show where each product is stronger.
          </p>
        </section>

        <section className="py-10 border-t border-white/[0.06]">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2">When to pick Podium</p>
            <h2 className="text-xl font-semibold text-zinc-100 mb-4">When Podium beats us</h2>
            <p className="text-sm text-zinc-400 leading-relaxed mb-3">
              If you need text marketing, payments, and webchat all under one roof — and you can absorb a $249+/month bill with an annual contract — Podium is the better choice.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              HeatRank AI is laser-focused on what gets HVAC contractors more calls from Google: keyword research, on-page SEO, rank tracking, and review replies. If those are your top priorities, you&apos;ll save 80%+ with us.
            </p>
          </div>
        </section>

        <section className="py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 tracking-tight mb-3">
            Try it free for 14 days
          </h2>
          <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">
            No demo call. No annual contract. Cancel in two clicks if it&apos;s not for you.
          </p>
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
            <Link href="/vs-seo-agency" className="hover:text-zinc-400">vs Agency</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
