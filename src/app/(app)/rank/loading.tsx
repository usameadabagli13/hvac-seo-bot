export default function RankLoading() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="h-3 w-16 bg-white/[0.05] rounded-full mb-3 animate-pulse" />
        <div className="h-7 w-44 bg-white/[0.07] rounded-lg mb-2 animate-pulse" />
        <div className="h-3 w-96 bg-white/[0.04] rounded-full animate-pulse" />
      </div>

      <div className="space-y-6">
        {/* Business card */}
        <div className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] animate-pulse">
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-40 bg-white/[0.07] rounded-full" />
            <div className="h-2.5 w-24 bg-white/[0.04] rounded-full" />
          </div>
        </div>

        {/* Map placeholder */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.01] h-[500px] flex items-center justify-center animate-pulse">
          <p className="text-sm text-zinc-700">Loading map…</p>
        </div>
      </div>
    </main>
  );
}
