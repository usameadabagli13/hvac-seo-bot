import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, TrendingUp, Star, Phone } from "lucide-react";

export const metadata: Metadata = {
  title:       "Sample HVAC Wins | HeatRank AI",
  description: "Illustrative HVAC SEO scenarios showing how HeatRank AI helps contractors rank higher on Google, fill their pipeline, and grow their business.",
  alternates:  { canonical: "/case-studies" },
  openGraph: {
    title:       "Sample HVAC Wins",
    description: "Illustrative scenarios showing how HVAC contractors use HeatRank AI to grow.",
    url:         "/case-studies",
    type:        "website",
  },
};

const STUDIES = [
  {
    company: "Comfort Air HVAC",
    city: "Dallas, TX",
    initials: "CA",
    headline: "From page 4 to top 3 in 12 weeks",
    bullets: [
      { icon: TrendingUp, label: "+34% organic calls",            value: "60 days" },
      { icon: Star,       label: "Google rating jumped 4.3 → 4.8", value: "87 reviews" },
      { icon: Phone,      label: "Top 3 for 8 keywords",            value: "Dallas core" },
    ],
    quote:
      "We were spending $2,400/month on an agency that gave us a 30-page PDF report nobody read. HeatRank actually moves the needle. First quarter, organic call volume was up 34%.",
    name: "Mike T., Owner",
  },
  {
    company: "Arctic Cool Services",
    city: "Phoenix, AZ",
    initials: "AC",
    headline: "Review velocity doubled in one quarter",
    bullets: [
      { icon: Star,       label: "Reviews per month",   value: "4 → 11"   },
      { icon: TrendingUp, label: "Avg star rating",      value: "4.2 → 4.9" },
      { icon: Phone,      label: "GMB profile views",    value: "+62%"     },
    ],
    quote:
      "The AI reply tool changed everything. I used to leave reviews unanswered for weeks. Now I reply to every one in under a minute, and customers comment on it.",
    name: "Sarah K., Owner",
  },
  {
    company: "ProClimate HVAC",
    city: "Houston, TX",
    initials: "PC",
    headline: "Outranked the regional chain in 6 weeks",
    bullets: [
      { icon: TrendingUp, label: "Map Pack appearances", value: "0 → 24/wk" },
      { icon: Phone,      label: "Direct calls from GMB", value: "+147%"     },
      { icon: Star,       label: "Beat 2 chain locations", value: "in core ZIPs" },
    ],
    quote:
      "We're a 4-truck operation competing with a 60-truck chain. The rank heatmap showed us exactly which neighborhoods to target. Six weeks later we're in the Map Pack for half the city.",
    name: "James R., Owner",
  },
];

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-zinc-700/10 rounded-full blur-[140px]" />
      </div>

      <header className="relative border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-20">
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

      <main className="relative max-w-4xl mx-auto px-6">
        <section className="pt-16 pb-12 text-center">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">
            Sample customer stories
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-100 mb-5 leading-tight">
            Sample HVAC wins.{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">
              Built from customer playbooks.
            </span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Three illustrative scenarios showing how HVAC contractors put HeatRank AI to work. Verified customer case studies publish here as our first cohort ships results.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/[0.06] text-[11px] font-medium text-amber-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Illustrative scenarios — not real customer testimonials yet
          </div>
        </section>

        <section className="pb-16 space-y-6">
          {STUDIES.map(({ company, city, initials, headline, bullets, quote, name }) => (
            <article key={company} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8 relative">
              <span className="absolute top-4 right-4 text-[10px] font-medium text-zinc-500 uppercase tracking-wider px-2 py-0.5 rounded border border-white/[0.08] bg-white/[0.02]">
                Sample scenario
              </span>
              <div className="flex items-center gap-4 mb-5 pb-5 border-b border-white/[0.05]">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-300 flex-shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-zinc-100 truncate">{company}</p>
                  <p className="text-xs text-zinc-500">{city}</p>
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-zinc-100 mb-5 tracking-tight">{headline}</h2>

              <div className="grid sm:grid-cols-3 gap-3 mb-6">
                {bullets.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
                    <Icon className="w-4 h-4 text-emerald-400 mb-2" />
                    <p className="text-sm font-bold text-zinc-100">{value}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">{label}</p>
                  </div>
                ))}
              </div>

              <blockquote className="text-sm text-zinc-300 italic leading-relaxed border-l-2 border-amber-500/40 pl-4">
                &ldquo;{quote}&rdquo;
              </blockquote>
              <p className="text-[11px] text-zinc-600 mt-3">— {name}, {company}</p>
            </article>
          ))}
        </section>

        <section className="pb-20">
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] px-6 py-12 sm:px-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 tracking-tight mb-3">
              Your story could be next
            </h2>
            <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto leading-relaxed">
              Free 14-day trial. No credit card. See your first AI-generated keyword list in 30 seconds.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 transition-all shadow-lg"
            >
              Start free trial <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-zinc-700">© {new Date().getFullYear()} HeatRank AI</span>
          <div className="flex items-center gap-6 text-xs text-zinc-600">
            <Link href="/" className="hover:text-zinc-400">Home</Link>
            <Link href="/pricing" className="hover:text-zinc-400">Pricing</Link>
            <Link href="/resources" className="hover:text-zinc-400">Resources</Link>
            <Link href="/about" className="hover:text-zinc-400">About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
