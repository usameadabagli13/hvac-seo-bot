import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, BookOpen, MapPin, Star, Search, Wrench, TrendingUp, Clock } from "lucide-react";
import { ARTICLES } from "@/data/articles";

export const metadata: Metadata = {
  title:       "HVAC SEO Resources & Tips | HeatRank AI",
  description: "Free local SEO guides for HVAC contractors. Learn how to rank higher on Google, manage reviews, and win more local calls.",
  alternates:  { canonical: "/resources" },
  openGraph: {
    title:       "HVAC SEO Resources & Tips",
    description: "Free local SEO guides for HVAC contractors.",
    url:         "/resources",
    type:        "website",
  },
};

const TIPS = [
  {
    icon: MapPin,
    title: "Claim and verify your Google Business Profile",
    desc: "Your GBP listing is the single most important factor for local HVAC SEO. Without it, you can't show up in the Map Pack — where 76% of clicks go.",
    bullets: [
      "Make sure your business name matches across every directory",
      "Set primary category as 'HVAC contractor' (not 'air conditioning service')",
      "Add 10+ photos of trucks, crews, and recent installs",
      "Verify your service area with all ZIP codes you serve",
    ],
  },
  {
    icon: Star,
    title: "Reply to every review within 24 hours",
    desc: "Google's local algorithm rewards businesses that engage with reviews. Slow or absent replies hurt rankings — and most contractors are silent.",
    bullets: [
      "Reply to 5-star reviews with thanks + the customer's first name",
      "Respond to negative reviews professionally — never defensively",
      "Use AI to draft 3 reply variants in seconds (HeatRank does this)",
      "Aim for 50+ Google reviews in your first year",
    ],
  },
  {
    icon: Search,
    title: "Target intent-driven HVAC keywords",
    desc: "Generic keywords like 'HVAC' don't convert. Real customers search with intent: a problem + their city.",
    bullets: [
      "'AC repair [your city]' converts 3x better than 'HVAC services'",
      "Long-tail wins: 'emergency furnace repair Dallas TX' beats 'furnace'",
      "Include 'near me' variants — 30% of mobile HVAC searches use it",
      "Cover the pain points: emergency, 24-hour, weekend, same-day",
    ],
  },
  {
    icon: Wrench,
    title: "Build dedicated service pages for each city",
    desc: "One homepage can't rank for every city you serve. Each major service area needs its own page.",
    bullets: [
      "Create /services/ac-repair-[city] for every primary city",
      "Add unique copy — not just find/replace city names",
      "Embed a Google Map of your service area on each page",
      "Link to relevant blog posts and case studies internally",
    ],
  },
  {
    icon: TrendingUp,
    title: "Track rankings weekly, not monthly",
    desc: "HVAC search is seasonal — AC searches spike June-August, furnace searches November-February. Monthly tracking misses critical drops.",
    bullets: [
      "Run a rank snapshot every Monday on your top 10 keywords",
      "Watch for ranking drops in your top 3-mile service radius",
      "Compare against your local competitors monthly",
      "Adjust keyword targets seasonally — don't push AC keywords in January",
    ],
  },
  {
    icon: BookOpen,
    title: "Publish HVAC content homeowners actually search",
    desc: "Blog posts answering homeowner questions rank for hundreds of long-tail keywords and bring qualified traffic.",
    bullets: [
      "'How much does AC repair cost in [your city]?' — high commercial intent",
      "'What size furnace do I need for a 2,000 sq ft house?' — buyer research",
      "'How often should I replace my HVAC filter?' — low intent but builds trust",
      "Aim for 1 long-form post per month minimum (1,500+ words)",
    ],
  },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-zinc-700/10 rounded-full blur-[140px]" />
      </div>

      {/* Nav */}
      <header className="relative border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/heatrank-logo.png" alt="HeatRank AI" width={32} height={32} className="rounded-xl w-8 h-8" priority />
            <span className="text-base font-semibold tracking-tight">
              <span className="text-zinc-100">HeatRank</span>
              <span className="text-zinc-400"> AI</span>
            </span>
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100 transition-all"
          >
            Start free <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <main className="relative max-w-4xl mx-auto px-6">
        {/* Hero */}
        <section className="pt-16 pb-12 text-center">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">
            Resources
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-100 mb-5 leading-tight">
            HVAC SEO tips that{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">
              actually move rankings
            </span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Six battle-tested local SEO plays we use across every HeatRank AI customer.
            No fluff, no generic SEO advice — just what works for HVAC contractors.
          </p>
        </section>

        {/* In-depth articles */}
        <section className="pb-12">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-5">In-depth guides</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {ARTICLES.map((a) => (
              <Link
                key={a.slug}
                href={`/resources/${a.slug}`}
                className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-white/[0.14] hover:bg-white/[0.04] transition-all"
              >
                <p className="text-[10px] font-medium text-amber-400 uppercase tracking-widest mb-2">{a.category}</p>
                <h3 className="text-base font-semibold text-zinc-100 group-hover:text-amber-300 transition-colors mb-1.5 leading-snug">{a.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed mb-3 line-clamp-2">{a.description}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-600">
                  <Clock className="w-3 h-3" />
                  {a.readTime}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="pb-16 space-y-5">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Quick tips</p>
          {TIPS.map(({ icon: Icon, title, desc, bullets }, i) => (
            <article
              key={title}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-7 hover:border-white/[0.10] transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-zinc-600 uppercase tracking-widest mb-1">
                    Tip {String(i + 1).padStart(2, "0")}
                  </p>
                  <h2 className="text-lg sm:text-xl font-semibold text-zinc-100 mb-2 tracking-tight">
                    {title}
                  </h2>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-4">{desc}</p>
                  <ul className="space-y-2">
                    {bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-sm text-zinc-400">
                        <div className="mt-2 w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* CTA */}
        <section className="pb-20">
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] px-6 py-12 sm:px-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 tracking-tight mb-3">
              Tired of doing this manually?
            </h2>
            <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto leading-relaxed">
              HeatRank AI handles all six tips automatically — keyword research, review replies, rank tracking, and on-page audits.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 active:scale-[0.98] transition-all shadow-lg"
            >
              Start your 14-day free trial <ChevronRight className="w-4 h-4" />
            </Link>
            <p className="mt-3 text-xs text-zinc-600">No credit card required</p>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-zinc-700">© {new Date().getFullYear()} HeatRank AI</span>
          <div className="flex items-center gap-6 text-xs text-zinc-600">
            <Link href="/" className="hover:text-zinc-400">Home</Link>
            <Link href="/pricing" className="hover:text-zinc-400">Pricing</Link>
            <Link href="/vs-seo-agency" className="hover:text-zinc-400">Compare</Link>
            <Link href="/privacy" className="hover:text-zinc-400">Privacy</Link>
            <Link href="/terms" className="hover:text-zinc-400">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
