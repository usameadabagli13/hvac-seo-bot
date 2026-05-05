"use client";

import ErrorView from "@/components/app/ErrorView";

export default function OnboardingError({
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
      title="Setup hit a snag"
      description="Something went wrong during onboarding. Your account is fine — try again or go straight to the dashboard."
      secondaryAction={{ label: "Go to dashboard", href: "/dashboard" }}
    />
  );
}
