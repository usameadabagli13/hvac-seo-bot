import { Star } from "lucide-react";

interface Props {
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  total: number;
}

export default function RatingDistributionChart({ distribution, total }: Props) {
  const max = Math.max(...Object.values(distribution), 1);

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-5">
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">
        Rating Distribution
      </h3>
      <div className="space-y-2.5">
        {([5, 4, 3, 2, 1] as const).map((star) => {
          const count = distribution[star] ?? 0;
          const pct = total === 0 ? 0 : (count / total) * 100;
          const barPct = max === 0 ? 0 : (count / max) * 100;
          const color =
            star >= 4
              ? "bg-emerald-500/60"
              : star === 3
              ? "bg-amber-500/60"
              : "bg-rose-500/50";

          return (
            <div key={star} className="flex items-center gap-3">
              {/* Star label */}
              <div className="flex items-center gap-1 w-8 flex-shrink-0">
                <span className="text-xs tabular-nums text-zinc-400">{star}</span>
                <Star className="w-3 h-3 text-zinc-600 fill-zinc-600" />
              </div>

              {/* Bar track */}
              <div className="flex-1 h-2 rounded-full bg-white/[0.05] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${color}`}
                  style={{ width: `${barPct}%` }}
                />
              </div>

              {/* Count + pct */}
              <div className="w-16 flex-shrink-0 text-right">
                <span className="text-xs tabular-nums text-zinc-500">
                  {count}
                  <span className="text-zinc-700 ml-1">({pct.toFixed(0)}%)</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
