export default function SchemaLoading() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="h-3 w-20 bg-white/[0.05] rounded-full mb-3 animate-pulse" />
        <div className="h-7 w-52 bg-white/[0.07] rounded-lg mb-2 animate-pulse" />
        <div className="h-3 w-80 bg-white/[0.04] rounded-full animate-pulse" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: form skeleton */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 space-y-4 animate-pulse">
            <div className="h-3.5 w-32 bg-white/[0.07] rounded-full" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-2.5 w-24 bg-white/[0.05] rounded-full" />
                <div className="h-10 w-full bg-white/[0.04] rounded-xl" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: JSON preview skeleton */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 animate-pulse">
          <div className="h-3.5 w-24 bg-white/[0.07] rounded-full mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-2.5 bg-white/[0.04] rounded-full"
                style={{ width: `${55 + (i % 4) * 10}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
