import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Authentication Error — HeatRank AI",
};

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-950/20 rounded-full blur-[128px]" />
      </div>

      <div className="relative w-full max-w-sm text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 mb-6">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
        </div>

        <h1 className="text-xl font-semibold text-zinc-100 tracking-tight mb-2">
          Authentication failed
        </h1>
        <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
          Something went wrong during sign-in. This can happen if the link
          expired or was already used. Please try again.
        </p>

        <Link
          href="/login"
          className="inline-flex items-center justify-center h-10 px-5 rounded-lg bg-white text-zinc-900 text-sm font-medium hover:bg-zinc-100 active:scale-[0.98] transition-all duration-150"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
