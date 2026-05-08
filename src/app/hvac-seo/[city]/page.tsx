import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Sparkles, MessageSquare, Map, FileSearch, Users, FileText, ChevronRight } from "lucide-react";
import { CITIES, getCityBySlug } from "@/data/cities";

export const revalidate = 86400;

export async function generateStaticParams() {
  return CITIES.map((city) => ({ city: city.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) return {};

  return {
    title: `HVAC SEO for ${city.name}, ${city.state} Contractors | HeatRank AI`,
    description: `Rank higher on Google in ${city.name}. HeatRank AI gives ${city.name} HVAC contractors AI-powered keyword research, review management, and rank tracking — no SEO agency needed.`,
    alternates: {
      canonical: `/hvac-seo/${city.slug}`,
    },
    openGraph: {
      title: `HVAC SEO for ${city.name} Contractors | HeatRank AI`,
      description: `Dominate local search in ${city.name}, ${city.stateFull}. AI-powered SEO tools built exclusively for HVAC contractors.`,
      type: "website",
      url: `/hvac-seo/${city.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `HVAC SEO for ${city.name} Contractors`,
      description: `AI-powered local SEO for HVAC contractors in ${city.name}, ${city.stateFull}.`,
    },
  };
}

const FEATURES = [
  {
    icon: Sparkles,
    title: "Local Keyword Research",
    desc: "Generate hyper-local HVAC keywords tailored to your exact city and service area in under 30 seconds.",
  },
  {
    icon: MessageSquare,
    title: "AI Review Replies",
    desc: "Get 3 professional reply variants for every Google review. Pick one, post it, done.",
  },
  {
    icon: Map,
    title: "Rank Heatmap",
    desc: "See exactly where you rank across a 5×5 grid around your business on Google Maps.",
  },
  {
    icon: FileSearch,
    title: "SEO Audit",
    desc: "Instant checklist of critical issues on every page of your site — with fixes explained in plain English.",
  },
  {
    icon: Users,
    title: "Competitor Spy",
    desc: "Track your rivals' ratings, review count, and keyword gaps — updated weekly.",
  },
  {
    icon: FileText,
    title: "Automated Reports",
    desc: "PDF summaries of your rankings, reviews, and SEO score delivered every Monday.",
  },
];

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "name": `HVAC SEO for ${city.name}, ${city.state} Contractors`,
        "description": `HeatRank AI helps HVAC contractors in ${city.name}, ${city.stateFull} rank higher on Google with AI-powered keyword research, review management, and rank tracking.`,
        "url": `https://www.heatrankai.com/hvac-seo/${city.slug}`,
        "isPartOf": { "@id": "https://www.heatrankai.com/#website" },
        "about": {
          "@type": "Service",
          "name": `HVAC SEO Services for ${city.name} Contractors`,
          "areaServed": {
            "@type": "City",
            "name": city.name,
            "containedInPlace": {
              "@type": "State",
              "name": city.stateFull,
            },
          },
          "provider": { "@id": "https://www.heatrankai.com/#organization" },
        },
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home",      "item": "https://www.heatrankai.com/" },
          { "@type": "ListItem", "position": 2, "name": "HVAC SEO",  "item": "https://www.heatrankai.com/" },
          { "@type": "ListItem", "position": 3, "name": city.name,   "item": `https://www.heatrankai.com/hvac-seo/${city.slug}` },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Nav */}
      <header className="border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/heatrank-logo.png"
              alt="HeatRank AI"
              width={32}
              height={32}
              className="rounded-xl w-8 h-8"
              priority
            />
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

      <main className="max-w-5xl mx-auto px-6">
        {/* Hero */}
        <section className="pt-16 pb-12 text-center">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">
            {city.name}, {city.state} · HVAC SEO
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-100 mb-5 leading-tight">
            HVAC SEO for{" "}
            <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
              {city.name}
            </span>{" "}
            Contractors
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-8">
            {city.name} homeowners search Google when their HVAC breaks. HeatRank AI gets your
            business to the top — without hiring an SEO agency.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 transition-all shadow-sm"
            >
              Start your 14-day free trial
            </Link>
            <Link
              href="/pricing"
              className="px-6 py-3 rounded-xl border border-white/10 text-zinc-300 text-sm hover:border-white/20 transition-all"
            >
              See pricing
            </Link>
          </div>
          <p className="mt-3 text-xs text-zinc-600">No credit card required</p>
        </section>

        {/* Dashboard mockup */}
        <section className="py-10">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-zinc-500">{city.name} · Live keyword preview</span>
              </div>
              <span className="text-[10px] text-zinc-600 border border-white/[0.06] px-2 py-0.5 rounded-full">AI-generated</span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-5">
              {[
                `${city.name} AC repair`,
                `${city.name} furnace replacement`,
                `HVAC contractor ${city.name}`,
                `${city.name} heating service`,
                `emergency AC ${city.name}`,
                `${city.name} air conditioning install`,
                `best HVAC ${city.name} ${city.state}`,
                `${city.name} furnace repair near me`,
              ].map((kw) => (
                <span key={kw} className="px-2.5 py-1 rounded-lg bg-zinc-700/40 border border-zinc-600/30 text-xs text-zinc-300">
                  {kw}
                </span>
              ))}
            </div>

            <div className="border-t border-white/[0.05] pt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Rank heatmap · {city.name} area</p>
                <span className="text-[10px] text-zinc-600 border border-white/[0.06] px-2 py-0.5 rounded-full">5×5 grid</span>
              </div>

              {/* Map-style mock with subtle grid + "streets" */}
              <div
                className="relative rounded-xl border border-white/[0.06] bg-zinc-900 overflow-hidden aspect-[5/4]"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px),
                    radial-gradient(circle at 30% 40%, rgba(245,158,11,0.06), transparent 50%),
                    radial-gradient(circle at 70% 60%, rgba(245,158,11,0.04), transparent 50%)
                  `,
                  backgroundSize: "40px 40px, 40px 40px, 100% 100%, 100% 100%",
                }}
              >
                {/* Diagonal "streets" */}
                <div className="absolute inset-0 pointer-events-none" aria-hidden>
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-white/[0.05]" />
                  <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/[0.05]" />
                  <div className="absolute -inset-10 origin-center rotate-[15deg] flex flex-col gap-12 opacity-30">
                    <div className="h-px bg-white/[0.06]" />
                    <div className="h-px bg-white/[0.06]" />
                  </div>
                </div>

                {/* Center business marker */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-30" style={{ width: 28, height: 28 }} />
                    <div className="w-7 h-7 rounded-full bg-amber-400 border-[3px] border-zinc-950 shadow-lg shadow-amber-500/40" />
                  </div>
                </div>

                {/* 5x5 rank pins */}
                <div className="absolute inset-3 grid grid-cols-5 grid-rows-5 gap-1 sm:gap-1.5">
                  {[1,4,2,7,3,5,1,3,6,2,3,2,1,4,8,6,3,2,1,5,4,7,3,2,1].map((rank, i) => {
                    const isTop3   = rank <= 3;
                    const isTop5   = rank <= 5;
                    const isTop7   = rank <= 7;
                    const bg       = isTop3 ? "bg-emerald-500" : isTop5 ? "bg-amber-500" : isTop7 ? "bg-orange-500" : "bg-rose-500/80";
                    const ring     = isTop3 ? "ring-emerald-400/30" : isTop5 ? "ring-amber-400/30" : isTop7 ? "ring-orange-400/30" : "ring-rose-400/30";
                    return (
                      <div key={i} className="flex items-center justify-center">
                        <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full ${bg} ring-4 ${ring} flex items-center justify-center text-[10px] sm:text-xs font-bold text-white shadow-md`}>
                          {rank}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Top-left compass label */}
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-zinc-950/80 border border-white/[0.06] text-[9px] text-zinc-500 font-mono uppercase tracking-wider">
                  N ↑
                </div>
              </div>

              {/* Legend */}
              <div className="mt-3 flex items-center justify-center gap-3 sm:gap-4 flex-wrap text-[10px]">
                <span className="flex items-center gap-1.5 text-zinc-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Top 3
                </span>
                <span className="flex items-center gap-1.5 text-zinc-500">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> 4–5
                </span>
                <span className="flex items-center gap-1.5 text-zinc-500">
                  <span className="w-2 h-2 rounded-full bg-orange-500" /> 6–7
                </span>
                <span className="flex items-center gap-1.5 text-zinc-500">
                  <span className="w-2 h-2 rounded-full bg-rose-500/80" /> 8+
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* City-specific context */}
        <section className="py-10 border-t border-white/[0.06]">
          <div className="grid sm:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-xl font-semibold text-zinc-100 mb-3">
                The {city.name} HVAC market is competitive
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                {city.marketNote}
              </p>
              <p className="text-sm text-zinc-500 leading-relaxed">
                {city.demandNote}
              </p>
            </div>
            <div className="space-y-4">
              {[
                `Rank for "${city.name} AC repair" and "${city.name} furnace replacement"`,
                `Track where you rank in ${city.name} neighborhoods`,
                `Reply to every Google review in seconds with AI`,
                `See what your ${city.name} competitors are ranking for`,
              ].map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <div className="mt-0.5 w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  </div>
                  <p className="text-sm text-zinc-400">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 border-t border-white/[0.06]">
          <h2 className="text-2xl font-semibold text-zinc-100 text-center mb-8">
            Every tool {city.name} HVAC contractors need to rank
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-sm font-medium text-zinc-200 mb-1">{title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Service areas */}
        <section className="py-10 border-t border-white/[0.06]">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3 text-center">
            Also serving contractors near {city.name}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {city.nearbyAreas.map((area) => (
              <span
                key={area}
                className="px-3 py-1 rounded-full border border-white/[0.08] text-xs text-zinc-500"
              >
                {area}, {city.state}
              </span>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center">
          <h2 className="text-2xl font-semibold text-zinc-100 mb-3">
            Ready to rank higher in {city.name}?
          </h2>
          <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">
            Join HVAC contractors across {city.stateFull} using HeatRank AI to win more
            calls from Google every month.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 transition-all shadow-sm"
          >
            Start free — 14-day trial <ChevronRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-zinc-700">© {new Date().getFullYear()} HeatRank AI</span>
          <div className="flex items-center gap-6 text-xs text-zinc-600">
            <Link href="/" className="hover:text-zinc-400">Home</Link>
            <Link href="/pricing" className="hover:text-zinc-400">Pricing</Link>
            <Link href="/privacy" className="hover:text-zinc-400">Privacy</Link>
            <Link href="/terms" className="hover:text-zinc-400">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
