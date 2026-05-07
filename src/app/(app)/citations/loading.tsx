export default function CitationsLoading() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="space-y-8 animate-pulse">
        <div className="space-y-2">
          <div className="h-3 w-20 rounded bg-white/[0.05]" />
          <div className="h-7 w-56 rounded-lg bg-white/[0.06]" />
          <div className="h-4 w-80 max-w-full rounded bg-white/[0.04]" />
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] h-16" />
          ))}
        </div>
      </div>
    </main>
  );
}
