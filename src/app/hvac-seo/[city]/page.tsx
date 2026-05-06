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
    openGraph: {
      title: `HVAC SEO for ${city.name} Contractors | HeatRank AI`,
      description: `Dominate local search in ${city.name}, ${city.stateFull}. AI-powered SEO tools built exclusively for HVAC contractors.`,
      type: "website",
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
