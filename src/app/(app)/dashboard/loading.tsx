export default function DashboardLoading() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <div className="space-y-8 animate-pulse">
        {/* Header */}
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-white/[0.05]" />
          <div className="h-7 w-72 rounded-lg bg-white/[0.06]" />
          <div className="h-4 w-96 max-w-full rounded bg-white/[0.04]" />
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="h-3 w-20 rounded bg-white/[0.05] mb-3" />
              <div className="h-8 w-16 rounded bg-white/[0.06]" />
            </div>
          ))}
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] h-[480px]" />
          <div className="lg:col-span-2 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] h-24" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
