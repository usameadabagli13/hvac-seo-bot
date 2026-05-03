export default function SettingsLoading() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="h-3 w-16 bg-white/[0.05] rounded-full mb-3 animate-pulse" />
        <div className="h-7 w-28 bg-white/[0.07] rounded-lg animate-pulse" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-8 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-20 bg-white/[0.05] rounded-lg" />
        ))}
      </div>

      {/* Form fields */}
      <div className="max-w-md space-y-5 animate-pulse">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-2.5 w-20 bg-white/[0.05] rounded-full" />
              <div className="h-10 w-full bg-white/[0.04] rounded-xl" />
            </div>
          ))}
          <div className="h-10 w-28 bg-white/[0.06] rounded-xl mt-2" />
        </div>
      </div>
    </main>
  );
}
