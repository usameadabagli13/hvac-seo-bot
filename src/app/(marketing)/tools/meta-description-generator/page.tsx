import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MetaDescriptionGenerator from "./MetaDescriptionGenerator";

export const metadata: Metadata = {
  title:       "Free Meta Description Generator for HVAC Sites | HeatRank AI",
  description: "Generate SEO-optimized meta descriptions for your HVAC pages. Length-checked, CTR-focused, free.",
  alternates:  { canonical: "/tools/meta-description-generator" },
};

export default function MetaDescriptionPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/tools" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to tools
          </Link>
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/heatrank-logo.png" alt="HeatRank AI" width={28} height={28} className="rounded-xl w-7 h-7" />
            <span className="text-sm font-semibold text-zinc-100 tracking-tight">HeatRank<span className="text-zinc-400"> AI</span></span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pt-12 pb-20">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">Free tool</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100 mb-3">
          Meta Description Generator
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed mb-10 max-w-2xl">
          Pick your service, city, and angle. We&apos;ll spit out three meta descriptions optimized for length (150–160 chars) and click-through.
        </p>

        <MetaDescriptionGenerator />

        <section className="mt-14 pt-10 border-t border-white/[0.06]">
          <h2 className="text-lg font-semibold text-zinc-100 mb-3">What makes a good HVAC meta description?</h2>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li>• 150–160 characters (Google truncates with &ldquo;…&rdquo; beyond ~160)</li>
            <li>• Lead with a benefit or pain point: &ldquo;AC died?&rdquo; not &ldquo;Welcome to&rdquo;</li>
            <li>• Include city + service for local intent</li>
            <li>• End with a clear call to action: &ldquo;Call today&rdquo;, &ldquo;Free quote&rdquo;</li>
            <li>• Mention urgency / availability when relevant: &ldquo;24/7&rdquo;, &ldquo;Same-day&rdquo;</li>
          </ul>
        </section>

        <section className="mt-10">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center">
            <p className="text-sm text-zinc-300 mb-4">
              Want auto-generated descriptions for <strong>every page</strong> on your site?
            </p>
            <Link href="/login" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 transition-all">
              Try HeatRank AI free <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
