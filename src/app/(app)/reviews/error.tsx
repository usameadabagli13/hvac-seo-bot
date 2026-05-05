"use client";

import ErrorView from "@/components/app/ErrorView";

export default function ReviewsError({
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
      title="Reviews failed to load"
      description="We couldn't fetch your reviews right now. No AI credits were used — try again."
    />
  );
}
