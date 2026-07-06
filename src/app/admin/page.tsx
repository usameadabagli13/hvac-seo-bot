import type { Metadata } from "next";
import { createAdminClient } from "@/utils/supabase/admin";
import { Users, CreditCard, MessageSquare, Map, FileSearch, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin — HeatRank AI",
};

export const revalidate = 60;

interface UsageRow { feature: string; count: number }

export default async function AdminOverviewPage() {
  const supabase = createAdminClient();

  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalUsers },
    { count: paidUsers },
    { count: trialUsers },
    { count: businesses },
    { count: reviews },
    { count: snapshotsRecent },
    { count: auditsRecent },
    { count: waitlist },
    { data: signupsRecent },
    { data: usageRows },
  ] = await Promise.all([
    supabase.from("profiles").select("user_id", { count: "exact", head: true }),
    supabase.from("profiles").select("user_id", { count: "exact", head: true }).neq("plan", "starter").is("trial_ends_at", null),
    supabase.from("profiles").select("user_id", { count: "exact", head: true }).gt("trial_ends_at", new Date().toISOString()),
    supabase.from("businesses").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("reviews").select("id", { count: "exact", head: true }),
    supabase.from("rank_snapshots").select("id", { count: "exact", head: true }).gte("created_at", since30).eq("is_mock", false),
    supabase.from("seo_audits").select("id", { count: "exact", head: true }).gte("audited_at", since30),
    supabase.from("waitlist").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("user_id, created_at").gte("created_at", since30).order("created_at", { ascending: false }).limit(10),
    supabase.from("ai_usage").select("feature, count").gte("period_start", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)),
  ]);

  const usageTotals: Record<string, number> = {};
  for (const row of (usageRows ?? []) as UsageRow[]) {
    usageTotals[row.feature] = (usageTotals[row.feature] ?? 0) + row.count;
  }

  const stats = [
    { label: "Toplam kullanıcı",    value: totalUsers ?? 0,       icon: <Users          className="w-4 h-4 text-zinc-400" /> },
    { label: "Ödeme yapan",        value: paidUsers ?? 0,        icon: <CreditCard     className="w-4 h-4 text-emerald-400" /> },
    { label: "Aktif deneme",       value: trialUsers ?? 0,       icon: <CreditCard     className="w-4 h-4 text-amber-400" /> },
    { label: "İşletme",            value: businesses ?? 0,       icon: <Users          className="w-4 h-4 text-zinc-400" /> },
    { label: "İndexlenen yorum",   value: reviews ?? 0,           icon: <MessageSquare  className="w-4 h-4 text-zinc-400" /> },
    { label: "Snapshot (30g)",     value: snapshotsRecent ?? 0,   icon: <Map            className="w-4 h-4 text-zinc-400" /> },
    { label: "SEO denetim (30g)",  value: auditsRecent ?? 0,      icon: <FileSearch     className="w-4 h-4 text-zinc-400" /> },
    { label: "Bekleme listesi",    value: waitlist ?? 0,          icon: <Mail           className="w-4 h-4 text-zinc-400" /> },
  ];

  return (
    <main className="relative max-w-5xl mx-auto px-6 py-12">
      <div className="mb-8">
        <p className="text-xs font-medium text-amber-400 uppercase tracking-widest mb-2">Admin</p>
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Genel Bakış</h1>
        <p className="mt-1.5 text-sm text-zinc-500">
          İç metrikler. Aksi belirtilmedikçe son 30 gün.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <div className="flex items-center gap-2 mb-1.5">
              {s.icon}
              <p className="text-[11px] text-zinc-600 uppercase tracking-wider">{s.label}</p>
            </div>
            <p className="text-2xl font-semibold text-zinc-200 tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Usage breakdown */}
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
            Bu ay AI kullanımı
          </p>
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] divide-y divide-white/[0.05]">
            {Object.entries(usageTotals).length === 0 && (
              <p className="px-4 py-5 text-xs text-zinc-600">Bu ay henüz kullanım yok.</p>
            )}
            {Object.entries(usageTotals).map(([feature, count]) => (
              <div key={feature} className="px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-zinc-300">{feature.replace(/_/g, " ")}</span>
                <span className="text-sm text-zinc-500 tabular-nums">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent signups */}
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
            Son 10 kayıt (30g)
          </p>
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] divide-y divide-white/[0.05]">
            {(signupsRecent ?? []).length === 0 && (
              <p className="px-4 py-5 text-xs text-zinc-600">Son 30 günde yeni kayıt yok.</p>
            )}
            {(signupsRecent ?? []).map((row) => (
              <div key={row.user_id} className="px-4 py-2.5 flex items-center justify-between">
                <code className="text-[10px] font-mono text-zinc-500 truncate max-w-[180px]">{row.user_id}</code>
                <span className="text-xs text-zinc-600">
                  {new Date(row.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
