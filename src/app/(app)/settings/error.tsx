"use client";

import ErrorView from "@/components/app/ErrorView";

export default function SettingsError({
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
      title="Settings failed to load"
      description="We couldn't load your account settings. Your subscription and data are unaffected — try again."
    />
  );
}
