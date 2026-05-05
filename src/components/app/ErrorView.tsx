"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface SecondaryAction {
  label: string;
  href: string;
}

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
  secondaryAction?: SecondaryAction;
}

export default function ErrorView({
  error,
  reset,
  title = "Something went wrong",
  description = "An unexpected error occurred. Your data is safe — try refreshing this section.",
  secondaryAction,
}: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] px-8 py-10 text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-rose-500/25 bg-rose-500/10">
          <AlertTriangle className="h-6 w-6 text-rose-400" />
        </div>

        <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">{description}</p>

        {error.digest && (
          <p className="mt-3 font-mono text-[11px] text-zinc-700">
            ref: {error.digest}
          </p>
        )}

        <div className="mt-7 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-black/20 transition-all duration-150 hover:bg-zinc-100 active:scale-[0.97]"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>

          {secondaryAction && (
            <Link
              href={secondaryAction.href}
              className="inline-flex items-center rounded-xl border border-white/[0.10] px-5 py-2.5 text-sm font-medium text-zinc-400 transition-colors duration-150 hover:border-white/[0.18] hover:text-zinc-200"
            >
              {secondaryAction.label}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
