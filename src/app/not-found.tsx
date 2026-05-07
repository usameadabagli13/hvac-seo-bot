import Link from "next/link";
import Image from "next/image";
import { Home, Search, ChevronRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-zinc-700/10 rounded-full blur-[140px]" />
      </div>

      <header className="relative border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/heatrank-logo.png" alt="HeatRank AI" width={32} height={32} className="rounded-xl w-8 h-8" />
            <span className="text-base font-semibold tracking-tight">
              <span className="text-zinc-100">HeatRank</span>
              <span className="text-zinc-400"> AI</span>
            </span>
          </Link>
        </div>
      </header>

      <main className="relative flex-1 flex items-center justify-center px-6 py-16">
        <div className="text-center max-w-md">
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest mb-3">
            Error 404
          </p>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-zinc-100 mb-4">
            Page not found
          </h1>
          <p className="text-sm text-zinc-500 leading-relaxed mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 active:scale-[0.98] transition-all"
            >
              <Home className="w-4 h-4" /> Go home
            </Link>
            <Link
              href="/pricing"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/[0.10] bg-white/[0.03] text-zinc-300 font-medium text-sm hover:bg-white/[0.06] hover:border-white/[0.15] transition-all"
            >
              See pricing
            </Link>
          </div>

          {/* Helpful links */}
          <div className="mt-12 pt-8 border-t border-white/[0.06]">
            <p className="text-[11px] font-medium text-zinc-600 uppercase tracking-widest mb-4">
              Popular pages
            </p>
            <div className="flex flex-col gap-2">
              {[
                { href: "/hvac-seo/dallas", label: "HVAC SEO for Dallas" },
                { href: "/hvac-seo/houston", label: "HVAC SEO for Houston" },
                { href: "/hvac-seo/phoenix", label: "HVAC SEO for Phoenix" },
                { href: "/login", label: "Sign in / Start free trial" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] text-sm text-zinc-400 hover:text-zinc-200 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-zinc-600" />
                    {l.label}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="relative border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center">
          <p className="text-[11px] text-zinc-700">© {new Date().getFullYear()} HeatRank AI</p>
        </div>
      </footer>
    </div>
  );
}
