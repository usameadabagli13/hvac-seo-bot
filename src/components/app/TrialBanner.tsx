import Link from "next/link";
import { Sparkles, AlertTriangle } from "lucide-react";

interface Props {
  trialDaysLeft: number;
  trialExpired: boolean;
}

export default function TrialBanner({ trialDaysLeft, trialExpired }: Props) {
  if (trialExpired) {
    return (
      <div className="sticky top-0 z-40 border-b border-red-500/30 bg-red-500/10 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 text-sm">
          <div className="flex items-center gap-2 text-red-200">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>
              <span className="font-semibold">Trial expired.</span>{" "}
              <span className="hidden sm:inline">You&apos;re on Starter — upgrade to restore Pro features.</span>
            </span>
          </div>
          <Link
            href="/settings?tab=billing"
            className="flex-shrink-0 rounded-md bg-white px-3 py-1 text-xs font-semibold text-zinc-900 hover:bg-zinc-200"
          >
            Upgrade
          </Link>
        </div>
      </div>
    );
  }

  const urgent = trialDaysLeft <= 3;
  const tone = urgent
    ? "border-amber-500/30 bg-amber-500/10 text-amber-100"
    : "border-zinc-800 bg-zinc-900/80 text-zinc-200";

  return (
    <div className={`sticky top-0 z-40 border-b backdrop-blur-sm ${tone}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 text-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 flex-shrink-0" />
          <span>
            <span className="font-semibold">
              {trialDaysLeft} day{trialDaysLeft === 1 ? "" : "s"} left
            </span>{" "}
            <span className="hidden sm:inline">in your free Pro trial</span>
          </span>
        </div>
        <Link
          href="/settings?tab=billing"
          className="flex-shrink-0 rounded-md bg-white px-3 py-1 text-xs font-semibold text-zinc-900 hover:bg-zinc-200"
        >
          Upgrade
        </Link>
      </div>
    </div>
  );
}
