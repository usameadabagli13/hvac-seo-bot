"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function OnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[onboarding] unhandled error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <p className="text-xs font-medium text-zinc-600 uppercase tracking-widest mb-3">
          Error
        </p>
        <h2 className="text-xl font-semibold text-zinc-100 mb-2">
          Setup hit a snag
        </h2>
        <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
          Something went wrong during onboarding. Your account is fine — try again or skip to the dashboard.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100 active:scale-[0.98] transition-colors duration-150"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg border border-white/[0.10] text-zinc-400 text-sm font-medium hover:text-zinc-200 hover:border-white/[0.18] transition-colors duration-150"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
