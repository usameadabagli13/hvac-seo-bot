"use client";

import ErrorView from "@/components/app/ErrorView";

export default function RankError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorView
      error={error}
      reset={reset}
      title="Rank Tracker failed to load"
      description="We couldn't fetch your ranking data. No credits were consumed — try again."
    />
  );
}
