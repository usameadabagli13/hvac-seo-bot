import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Sparkles, Bug, Zap } from "lucide-react";

export const metadata: Metadata = {
  title:       "Changelog | HeatRank AI",
  description: "Every update we ship. New features, improvements, and fixes — sorted by date.",
  alternates:  { canonical: "/changelog" },
};

const RELEASES = [
  {
    date: "2026-05-07",
    version: "1.4.0",
    highlights: [
      { type: "feature", text: "Free SEO tools: title tag checker, meta description generator, keyword density analyzer" },
      { type: "feature", text: "Case studies, FAQ, contact, glossary, integrations, roadmap, and changelog pages" },
      { type: "feature", text: "/vs-podium and /vs-birdeye competitor comparison pages" },
      { type: "feature", text: "18 dedicated state landing pages aggregating cities (TX, FL, CA, etc.)" },
      { type: "feature", text: "Mobile hamburger menu with sticky scroll-CTA" },
      { type: "improvement", text: "Trust bar with SOC 2 / GDPR / 256-bit encryption / 99.9% uptime" },
      { type: "improvement", text: "Skip-to-content accessibility link in layout" },
      { type: "fix", text: "Run Snapshot now disabled when GBP not connected (no wasted credits)" },
      { type: "fix", text: "Reviews page no longer crashes when no GBP integration exists" },
      { type: "fix", text: "Favicon now uses HeatRank logo (was showing Vercel default)" },
    ],
  },
  {
    date: "2026-05-06",
    version: "1.3.0",
    highlights: [
      { type: "feature", text: "Email magic link login alongside Google OAuth" },
      { type: "feature", text: "25 dedicated city landing pages (/hvac-seo/[city])" },
      { type: "feature", text: "/resources, /about, /vs-seo-agency marketing pages" },
      { type: "feature", text: "Auto review sync via daily Vercel Cron" },
      { type: "feature", text: "Dynamic OG images via next/og for homepage and city pages" },
      { type: "improvement", text: "Pricing page money-back guarantee card" },
      { type: "improvement", text: "Homepage stats section (97% / 46% / 76% / $10B)" },
      { type: "improvement", text: "JSON-LD: BreadcrumbList, FAQPage, AggregateOffer expanded" },
    ],
  },
  {
    date: "2026-05-04",
    version: "1.2.0",
    highlights: [
      { type: "feature", text: "Schema markup generator (LocalBusiness, Service, Review)" },
      { type: "feature", text: "Founding-member promo with claimed counter" },
      { type: "feature", text: "Trial expiry email automation (day 12)" },
      { type: "improvement", text: "Sitemap auto-generated from CITIES data" },
      { type: "improvement", text: "Onboarding wizard tour (collapsed pill on dashboard)" },
    ],
  },
  {
    date: "2026-04-28",
    version: "1.1.0",
    highlights: [
      { type: "feature", text: "Live demo widget on homepage (no signup keyword preview)" },
      { type: "feature", text: "Pricing toggle (monthly ↔ annual with 20% savings)" },
      { type: "feature", text: "Avatar upload via Supabase Storage" },
      { type: "improvement", text: "Reviews list with sentiment badges and auto-sync" },
    ],
  },
  {
    date: "2026-04-20",
    version: "1.0.0",
    highlights: [
      { type: "feature", text: "Public launch 🚀" },
      { type: "feature", text: "AI keyword research with Google Suggest grounding" },
      { type: "feature", text: "5×5 rank heatmap on Google Maps with weekly snapshots" },
      { type: "feature", text: "AI review reply generator (3 styles per review)" },
      { type: "feature", text: "On-page SEO audit (Gemini-scored, with fix suggestions)" },
      { type: "feature", text: "Citations directory checker (top 25 platforms)" },
      { type: "feature", text: "Google Business Profile OAuth integration" },
    ],
  },
];

const TYPE_META = {
  feature:     { icon: Sparkles, label: "New",         color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  improvement: { icon: Zap,      label: "Improved",    color: "text-blue-400 bg-blue-500/10 border-blue-500/20"   },
  fix:         { icon: Bug,      label: "Fixed",       color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
} as const;

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
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

      <main className="max-w-3xl mx-auto px-6 pt-12 pb-20">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">Changelog</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100 mb-3">
          Every update we ship
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed mb-12 max-w-2xl">
          We ship weekly. Below is every meaningful change since launch — features, improvements, and fixes.
        </p>

        <div className="space-y-10">
          {RELEASES.map(({ date, version, highlights }) => (
            <section key={version} className="border-l-2 border-white/[0.06] pl-6 relative">
              <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-amber-400" />
              <div className="flex items-baseline gap-3 mb-4">
                <h2 className="text-base font-bold text-zinc-100">v{version}</h2>
                <span className="text-xs text-zinc-600">
                  {new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </span>
              </div>
              <ul className="space-y-2.5">
                {highlights.map((h, i) => {
                  const meta = TYPE_META[h.type as keyof typeof TYPE_META];
                  const Icon = meta.icon;
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${meta.color}`}>
                        <Icon className="w-2.5 h-2.5" />
                        {meta.label}
                      </span>
                      <span className="text-sm text-zinc-300 leading-relaxed">{h.text}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        <section className="mt-16">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center">
            <p className="text-sm text-zinc-300 mb-4">
              Want to know what&apos;s next?{" "}
              <Link href="/roadmap" className="text-amber-400 hover:underline">See the roadmap</Link>
              {" "}or request a feature.
            </p>
            <Link href="/login" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 transition-all">
              Start free trial <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
