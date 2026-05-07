import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Search, MessageSquare, CreditCard, Shield, Mail, Database, Zap } from "lucide-react";

export const metadata: Metadata = {
  title:       "Integrations | HeatRank AI",
  description: "HeatRank AI plays nicely with Google Business Profile, Stripe, Resend, Supabase and the rest of your stack. See every integration we support.",
  alternates:  { canonical: "/integrations" },
  openGraph: {
    title:       "HeatRank AI Integrations",
    description: "GBP, Stripe, Resend, Supabase, and more.",
    url:         "/integrations",
    type:        "website",
  },
};

const INTEGRATIONS = [
  {
    icon: Search,
    name: "Google Business Profile",
    status: "Live",
    desc: "Sync your reviews automatically every day, generate AI-powered replies, and track Map Pack rankings. The single most important integration for local HVAC SEO.",
  },
  {
    icon: Shield,
    name: "Google OAuth",
    status: "Live",
    desc: "Sign in to HeatRank AI with your existing Google account in two clicks — no password to remember.",
  },
  {
    icon: Mail,
    name: "Email magic link",
    status: "Live",
    desc: "No Google account? No problem. Sign in with your email and we'll send a one-click magic link.",
  },
  {
    icon: CreditCard,
    name: "Dodo Payments",
    status: "Live",
    desc: "Secure recurring billing with annual / monthly plan switching, automatic invoice generation, and one-click cancellation.",
  },
  {
    icon: Database,
    name: "Supabase",
    status: "Live",
    desc: "Your data is hosted on Supabase's SOC 2 Type II infrastructure with row-level security, daily backups, and end-to-end encryption.",
  },
  {
    icon: MessageSquare,
    name: "Resend",
    status: "Live",
    desc: "Transactional emails (trial reminders, login links, weekly digests) sent through Resend for industry-leading deliverability.",
  },
  {
    icon: Zap,
    name: "Google Gemini AI",
    status: "Live",
    desc: "Powers our keyword research, review reply generation, and on-page audit scoring with the latest Gemini models.",
  },
  {
    icon: Search,
    name: "Mapbox",
    status: "Live",
    desc: "Renders the 5×5 rank heatmap with live geocoding for any service area in the US.",
  },
];

const COMING_SOON = [
  { name: "Facebook Reviews",    when: "Q3 2026" },
  { name: "Yelp Reviews",        when: "Q3 2026" },
  { name: "QuickBooks",          when: "Q4 2026" },
  { name: "ServiceTitan",        when: "Q4 2026" },
  { name: "HubSpot CRM",         when: "Q1 2027" },
  { name: "Zapier",              when: "Q1 2027" },
];

export default function IntegrationsPage() {
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
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">Integrations</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-100 mb-5 leading-tight">
            Plays nicely with{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">your stack</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            HeatRank AI connects to the tools you already use — Google Business Profile, Stripe, Supabase, Gemini, and more. No new accounts to manage.
          </p>
        </section>

        <section className="py-8">
          <p className="text-xs font-semibold text-zinc-300 uppercase tracking-widest mb-5">Live integrations</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {INTEGRATIONS.map(({ icon: Icon, name, status, desc }) => (
              <div key={name} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400">
                    <span className="w-1 h-1 rounded-full bg-emerald-400" /> {status}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-100 mb-1.5">{name}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-10 border-t border-white/[0.06]">
          <p className="text-xs font-semibold text-zinc-300 uppercase tracking-widest mb-5">Coming soon</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {COMING_SOON.map(({ name, when }) => (
              <div key={name} className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.01] p-4 flex items-center justify-between">
                <span className="text-sm text-zinc-400">{name}</span>
                <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">{when}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 tracking-tight mb-3">
            Don&apos;t see your tool?
          </h2>
          <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">
            Tell us what you use. The most-requested integrations always make it onto the roadmap.
          </p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 transition-all shadow-lg">
            Request an integration <ChevronRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      <footer className="border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-zinc-700">© {new Date().getFullYear()} HeatRank AI</span>
          <div className="flex items-center gap-6 text-xs text-zinc-600">
            <Link href="/" className="hover:text-zinc-400">Home</Link>
            <Link href="/pricing" className="hover:text-zinc-400">Pricing</Link>
            <Link href="/contact" className="hover:text-zinc-400">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
