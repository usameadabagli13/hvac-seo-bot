export default function ReviewsLoading() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="h-3 w-20 bg-white/[0.05] rounded-full mb-3 animate-pulse" />
        <div className="h-7 w-48 bg-white/[0.07] rounded-lg mb-2 animate-pulse" />
        <div className="h-3 w-80 bg-white/[0.04] rounded-full animate-pulse" />
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 animate-pulse"
          >
            <div className="h-2.5 w-16 bg-white/[0.05] rounded-full mb-3" />
            <div className="h-6 w-10 bg-white/[0.07] rounded-lg" />
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-20 bg-white/[0.04] rounded-lg animate-pulse" />
        ))}
      </div>

      {/* Review cards */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 animate-pulse"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-white/[0.06] flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-32 bg-white/[0.07] rounded-full" />
                <div className="h-2.5 w-24 bg-white/[0.04] rounded-full" />
                <div className="h-3 w-full bg-white/[0.04] rounded-full mt-3" />
                <div className="h-3 w-3/4 bg-white/[0.04] rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
