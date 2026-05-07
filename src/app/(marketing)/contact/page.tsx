import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Mail, MessageCircle, Clock } from "lucide-react";

export const metadata: Metadata = {
  title:       "Contact HeatRank AI",
  description: "Get in touch with the HeatRank AI team. Email support, sales, or feedback. We reply within one business day.",
  alternates:  { canonical: "/contact" },
};

const SUPPORT_EMAIL = "support@heatrankai.com";

export default function ContactPage() {
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

      <main className="max-w-3xl mx-auto px-6 pt-16 pb-20">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3 text-center">Contact</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-100 mb-3 text-center">
          Get in touch
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed mb-12 max-w-xl mx-auto text-center">
          Email is the fastest way to reach us. We&apos;re a small team, so you&apos;ll
          usually get a response within one business day — often the same hour.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=Support`}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-white/[0.14] transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
              <Mail className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-base font-semibold text-zinc-100 mb-1">Support</h2>
            <p className="text-xs text-zinc-500 leading-relaxed mb-3">
              Account, billing, or product questions.
            </p>
            <span className="text-xs text-zinc-300 group-hover:text-amber-300 transition-colors break-all">
              {SUPPORT_EMAIL}
            </span>
          </a>

          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=Feedback`}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-white/[0.14] transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
              <MessageCircle className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-base font-semibold text-zinc-100 mb-1">Feedback &amp; ideas</h2>
            <p className="text-xs text-zinc-500 leading-relaxed mb-3">
              Feature requests, bug reports, or just to say hi.
            </p>
            <span className="text-xs text-zinc-300 group-hover:text-amber-300 transition-colors break-all">
              {SUPPORT_EMAIL}
            </span>
          </a>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-emerald-300 mb-1">Response time</h3>
            <p className="text-xs text-emerald-200/70 leading-relaxed">
              We aim to respond to every email within one US business day. Founder responds personally to the first 100 customers — that&apos;s probably you.
            </p>
          </div>
        </div>

        <section className="mt-16 text-center">
          <h2 className="text-xl font-semibold text-zinc-100 mb-3">Looking for an answer right now?</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/faq" className="px-4 py-2 rounded-xl border border-white/[0.10] bg-white/[0.03] text-zinc-300 text-sm hover:bg-white/[0.06] transition-all">
              Browse FAQs
            </Link>
            <Link href="/resources" className="px-4 py-2 rounded-xl border border-white/[0.10] bg-white/[0.03] text-zinc-300 text-sm hover:bg-white/[0.06] transition-all">
              SEO resources
            </Link>
            <Link href="/pricing" className="px-4 py-2 rounded-xl border border-white/[0.10] bg-white/[0.03] text-zinc-300 text-sm hover:bg-white/[0.06] transition-all">
              Pricing
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
