"use client";

import ErrorView from "@/components/app/ErrorView";

export default function BusinessDetailError({
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
      title="Business details failed to load"
      description="We couldn't load this business's data. Your reviews and settings are safe — try again."
    />
  );
}
