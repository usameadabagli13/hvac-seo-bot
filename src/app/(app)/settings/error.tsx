"use client";

import { useEffect } from "react";

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[settings] unhandled error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <p className="text-xs font-medium text-zinc-600 uppercase tracking-widest mb-3">
          Error
        </p>
        <h2 className="text-xl font-semibold text-zinc-100 mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
          An unexpected error occurred loading your settings. Try refreshing,
          or contact support if the problem persists.
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100 active:scale-[0.98] transition-colors duration-150"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
