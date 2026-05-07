import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Check, CircleDashed, Circle, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title:       "Product Roadmap | HeatRank AI",
  description: "What we're building next at HeatRank AI. See shipped, in-progress, and upcoming features for HVAC contractors.",
  alternates:  { canonical: "/roadmap" },
};

const ROADMAP = [
  {
    status: "shipped",
    quarter: "Q2 2026",
    items: [
      "AI keyword research with Google Suggest grounding",
      "5×5 rank heatmap on Google Maps",
      "On-page SEO audit (Gemini-scored)",
      "AI review reply generator (3 styles)",
      "Schema markup generator",
      "25 dedicated city landing pages",
      "Free SEO tools (title, meta, density)",
      "30-day money-back guarantee",
    ],
  },
  {
    status: "progress",
    quarter: "Q3 2026 — building now",
    items: [
      "Facebook reviews integration",
      "Yelp reviews integration",
      "Bulk review actions (mark replied, archive)",
      "CSV export for reviews and rank history",
      "Weekly HTML email digest with rank changes",
      "Customer Q&A automation for GBP",
    ],
  },
  {
    status: "next",
    quarter: "Q4 2026",
    items: [
      "QuickBooks integration (job → review request automation)",
      "ServiceTitan integration",
      "Multi-location dashboard (for chains)",
      "Team-member invites with role permissions",
      "Public review widget (embed on your site)",
      "Automatic citation submission to top 25 directories",
    ],
  },
  {
    status: "future",
    quarter: "2027 and beyond",
    items: [
      "HubSpot CRM sync",
      "Zapier integration",
      "Public API + webhooks",
      "AI-generated blog post drafts",
      "Photo SEO optimization (geotag, alt text)",
      "Competitor change alerts",
    ],
  },
];

const STATUS_META = {
  shipped:  { icon: Check,        label: "Shipped",      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  progress: { icon: Sparkles,     label: "In progress",  color: "text-amber-400 bg-amber-500/10 border-amber-500/20"     },
  next:     { icon: CircleDashed, label: "Next up",      color: "text-blue-400 bg-blue-500/10 border-blue-500/20"        },
  future:   { icon: Circle,       label: "Future",       color: "text-zinc-500 bg-white/[0.03] border-white/[0.08]"      },
} as const;

export default function RoadmapPage() {
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
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">Roadmap</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100 mb-3">
          What we&apos;re building
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed mb-12 max-w-2xl">
          Public roadmap so you know what&apos;s coming. The order can shift based on customer requests — got an idea?{" "}
          <Link href="/contact" className="text-amber-400 hover:underline">Tell us</Link>.
        </p>

        <div className="space-y-8">
          {ROADMAP.map(({ status, quarter, items }) => {
            const meta = STATUS_META[status as keyof typeof STATUS_META];
            const Icon = meta.icon;
            return (
              <section key={status}>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-widest ${meta.color}`}>
                    <Icon className="w-3 h-3" /> {meta.label}
                  </span>
                  <span className="text-xs text-zinc-600">{quarter}</span>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-2">
                  {items.map((item) => (
                    <div key={item} className="flex items-start gap-3 py-1">
                      <Icon className={`w-3.5 h-3.5 ${meta.color.split(" ")[0]} mt-0.5 flex-shrink-0`} />
                      <span className="text-sm text-zinc-300">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <section className="mt-16">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center">
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">Have an idea?</h2>
            <p className="text-sm text-zinc-500 mb-5 max-w-md mx-auto">
              Customer requests directly shape this roadmap. Email us or use the in-app feedback button.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 transition-all">
              Request a feature <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
