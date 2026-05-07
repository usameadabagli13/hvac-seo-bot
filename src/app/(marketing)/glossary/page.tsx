import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title:       "HVAC SEO Glossary | HeatRank AI",
  description: "Plain-English definitions for the SEO and local-search terms HVAC contractors need to know. From GBP to Map Pack to schema markup.",
  alternates:  { canonical: "/glossary" },
  openGraph: {
    title:       "HVAC SEO Glossary",
    description: "Plain-English definitions for HVAC SEO terms.",
    url:         "/glossary",
    type:        "website",
  },
};

const TERMS = [
  { term: "Google Business Profile (GBP)", short: "Free Google listing", def: "The free Google business listing (formerly Google My Business) that controls how your HVAC company appears on Google Search and Maps. Without it, you can't show up in the Map Pack." },
  { term: "Map Pack",                       short: "Top 3 local results", def: "The block of three local business listings Google shows above organic search results. ~76% of local searches click a Map Pack result, making it the most valuable real estate in HVAC SEO." },
  { term: "Local SEO",                      short: "City-focused SEO",    def: "The practice of optimizing a business website to rank for searches with local intent (e.g., 'AC repair Dallas'). Different from general SEO because Google's local algorithm weights GBP, citations, and proximity heavily." },
  { term: "Citation",                       short: "Mention of NAP",      def: "A mention of your business Name, Address, and Phone (NAP) on any third-party site — like Yelp, BBB, or Angi. Google uses citation consistency to verify your business is real and well-established." },
  { term: "NAP consistency",                short: "Name/Address/Phone",  def: "Making sure your business Name, Address, and Phone number appear identically across every directory, your website, and your GBP. Inconsistencies cause Google to lose trust in your listing." },
  { term: "Schema markup",                  short: "Structured data",     def: "Hidden code on your website that tells Google what your content means — your business type, hours, services, ratings, etc. HVAC contractors should use LocalBusiness and Service schema." },
  { term: "Title tag",                      short: "Page tab title",      def: "The HTML title element shown in browser tabs and as the clickable headline on Google. Should be 50–60 characters and contain your primary HVAC keyword + city." },
  { term: "Meta description",               short: "Search snippet",      def: "The 150–160-character summary Google shows below the title on search results. Doesn't directly affect rankings, but a strong description boosts click-through rate (CTR)." },
  { term: "Backlink",                       short: "Link from another site", def: "A link from another website pointing to yours. Google treats links from reputable sites (chamber of commerce, local news, BBB) as votes of confidence — improving your rankings." },
  { term: "Anchor text",                    short: "Linked words",        def: "The clickable words inside a backlink. 'AC repair Dallas' is better anchor text for an HVAC site than 'click here' because it tells Google what the linked page is about." },
  { term: "Domain authority",               short: "Site trust score",    def: "A 1–100 score (developed by Moz) estimating how likely a domain is to rank. New HVAC sites start near 1; established competitors are usually 20–40. Backlinks raise it." },
  { term: "Core Web Vitals",                short: "Page speed metrics",  def: "Google's three speed metrics — LCP, INP, CLS — that influence rankings. Slow sites hurt your Map Pack and organic positions, especially on mobile." },
  { term: "Mobile-first indexing",          short: "Mobile decides ranking", def: "Google now ranks websites based on the mobile version, not desktop. If your HVAC site looks broken on a phone, your rankings suffer — even from desktop searchers." },
  { term: "Search intent",                  short: "Why someone searched", def: "What a user actually wants when they type a keyword. 'AC repair near me' has high commercial intent (ready to call). 'How does AC work' has informational intent (researching). Match content to intent." },
  { term: "Long-tail keyword",              short: "Specific phrase",     def: "A 4+ word keyword like 'emergency furnace repair Dallas TX'. Lower volume than short-tail ('furnace'), but higher conversion because the searcher is specific about what they need." },
  { term: "Keyword density",                short: "How often you say a word", def: "The percentage of total words on a page that are a target keyword. Aim for 1–3% on your primary HVAC keyword. Above 4% is keyword stuffing and gets penalized." },
  { term: "On-page SEO",                    short: "Optimizing your pages", def: "Everything you control on your own website: title tags, headings, content, images, internal links, schema. Contrasts with off-page SEO (backlinks, citations)." },
  { term: "Off-page SEO",                   short: "Reputation signals",  def: "Things that affect ranking but happen on other sites: backlinks, citations, online reviews, social signals. For local HVAC, off-page is dominated by GBP reviews and citation consistency." },
  { term: "SERP",                           short: "Search results page", def: "Search Engine Results Page — what Google shows after a query. The HVAC SERP usually includes ads at top, then a Map Pack, then 10 organic results, often with a 'People Also Ask' box." },
  { term: "Click-through rate (CTR)",       short: "% of viewers who click", def: "How often searchers click your result when it appears. A 5% CTR means 5 of every 100 people who see your listing click it. Strong title + meta = higher CTR = better rankings over time." },
  { term: "Bounce rate",                    short: "% who leave fast",    def: "The share of visitors who leave your site without doing anything. High bounce on an HVAC homepage suggests slow load, irrelevant content, or weak design — and can drag down rankings." },
  { term: "Service Area Business (SAB)",    short: "No physical storefront", def: "A business that travels to customers (most HVAC). On GBP you mark this so Google hides your address but lists the cities/ZIPs you serve — critical for SAB visibility." },
];

export default function GlossaryPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
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

      <main className="max-w-4xl mx-auto px-6 pt-16 pb-20">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3 text-center">Glossary</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-100 mb-3 text-center">
          HVAC SEO terms,{" "}
          <span className="bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">
            in plain English
          </span>
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed mb-12 max-w-2xl mx-auto text-center">
          {TERMS.length} essential SEO and local-search terms HVAC contractors should know.
          Bookmark this for the next time your agency throws jargon at you.
        </p>

        <dl className="space-y-3">
          {TERMS.map(({ term, short, def }) => (
            <div key={term} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-white/[0.10] transition-colors">
              <dt className="flex items-baseline gap-2 flex-wrap mb-2">
                <span className="text-base font-semibold text-zinc-100">{term}</span>
                <span className="text-[11px] text-amber-400 font-medium">· {short}</span>
              </dt>
              <dd className="text-sm text-zinc-400 leading-relaxed">{def}</dd>
            </div>
          ))}
        </dl>

        <section className="mt-16">
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] px-6 py-12 sm:px-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 tracking-tight mb-3">
              You don&apos;t need to memorize this
            </h2>
            <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto leading-relaxed">
              HeatRank AI handles the technical SEO so you can focus on installs and customer calls.
            </p>
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 transition-all shadow-lg">
              Try it free <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
