"use client";

import ErrorView from "@/components/app/ErrorView";

export default function DashboardError({
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
      title="Dashboard failed to load"
      description="We couldn't fetch your business overview. This is usually a temporary network issue — your data is safe."
    />
  );
}
