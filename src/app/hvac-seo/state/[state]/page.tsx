import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronRight, MapPin } from "lucide-react";
import { CITIES } from "@/data/cities";

export const revalidate = 86400;

// Build a unique state index from CITIES
const STATE_INDEX = (() => {
  const map = new Map<string, { state: string; stateFull: string; cities: typeof CITIES }>();
  for (const c of CITIES) {
    const slug = c.state.toLowerCase();
    if (!map.has(slug)) map.set(slug, { state: c.state, stateFull: c.stateFull, cities: [] });
    map.get(slug)!.cities.push(c);
  }
  return map;
})();

export async function generateStaticParams() {
  return [...STATE_INDEX.keys()].map((s) => ({ state: s }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>;
}): Promise<Metadata> {
  const { state: slug } = await params;
  const entry = STATE_INDEX.get(slug.toLowerCase());
  if (!entry) return {};

  return {
    title: `HVAC SEO for ${entry.stateFull} Contractors | HeatRank AI`,
    description: `Local SEO tools for HVAC contractors across ${entry.stateFull}. Rank higher in every major ${entry.state} city — Dallas, Houston, Austin, and more.`,
    alternates: { canonical: `/hvac-seo/state/${slug}` },
    openGraph: {
      title: `HVAC SEO for ${entry.stateFull} Contractors`,
      description: `AI-powered local SEO for HVAC contractors in ${entry.stateFull}.`,
      url: `/hvac-seo/state/${slug}`,
      type: "website",
    },
  };
}

export default async function StatePage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state: slug } = await params;
  const entry = STATE_INDEX.get(slug.toLowerCase());
  if (!entry) notFound();

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
            {entry.stateFull} · HVAC SEO
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-100 mb-5 leading-tight">
            HVAC SEO for{" "}
            <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
              {entry.stateFull}
            </span>{" "}
            contractors
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-8">
            Whether you serve {entry.cities[0].name}, {entry.cities[1]?.name ?? "a metro area"}, or anywhere across {entry.state}, HeatRank AI helps you rank higher on Google — without an SEO agency.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 transition-all shadow-lg"
          >
            Start your 14-day free trial <ChevronRight className="w-4 h-4" />
          </Link>
          <p className="mt-3 text-xs text-zinc-600">No credit card required</p>
        </section>

        <section className="py-12 border-t border-white/[0.06]">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-6 text-center">
            Cities we cover in {entry.state}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {entry.cities.map((c) => (
              <Link
                key={c.slug}
                href={`/hvac-seo/${c.slug}`}
                className="group flex items-start gap-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.14] hover:bg-white/[0.04] transition-all"
              >
                <MapPin className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-100 group-hover:text-amber-300 transition-colors">
                    {c.name}, {c.state}
                  </p>
                  <p className="text-[11px] text-zinc-600 mt-0.5 line-clamp-2 leading-snug">
                    {c.climate}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-amber-400 transition-colors mt-0.5" />
              </Link>
            ))}
          </div>
        </section>

        <section className="py-16 text-center border-t border-white/[0.06]">
          <h2 className="text-2xl font-semibold text-zinc-100 mb-3 tracking-tight">
            Ready to rank in {entry.state}?
          </h2>
          <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">
            Join HVAC contractors across {entry.stateFull} using HeatRank AI to win more calls every month.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 transition-all"
          >
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
            <Link href="/resources" className="hover:text-zinc-400">Resources</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
