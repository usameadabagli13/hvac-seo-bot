export default function AppLoading() {
  return (
    <main className="relative max-w-5xl mx-auto px-6 py-12 animate-pulse">
      {/* Page heading skeleton */}
      <div className="mb-10 space-y-3">
        <div className="h-3 w-20 rounded-full bg-white/[0.05]" />
        <div className="h-8 w-64 rounded-xl bg-white/[0.05]" />
        <div className="h-4 w-96 rounded-lg bg-white/[0.04]" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-4">
        <div className="h-32 rounded-2xl bg-white/[0.03] border border-white/[0.05]" />
        <div className="h-48 rounded-2xl bg-white/[0.03] border border-white/[0.05]" />
        <div className="h-24 rounded-2xl bg-white/[0.03] border border-white/[0.05]" />
      </div>
    </main>
  );
}
