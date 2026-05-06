import type { Metadata } from "next";
import { createAdminClient } from "@/utils/supabase/admin";
import { Download } from "lucide-react";

export const metadata: Metadata = { title: "Waitlist — Admin" };
export const revalidate = 60;

interface WaitlistEntry {
  id:           string;
  email:        string;
  name:         string | null;
  company:      string | null;
  source:       string;
  is_founding:  boolean;
  coupon_code:  string | null;
  created_at:   string;
}

export default async function AdminWaitlistPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("waitlist")
    .select("id, email, name, company, source, is_founding, coupon_code, created_at")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as WaitlistEntry[];
  const foundingCount = rows.filter((r) => r.is_founding).length;

  return (
    <main className="relative max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-medium text-amber-400 uppercase tracking-widest mb-2">Admin</p>
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Waitlist</h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            {rows.length} total signups · <span className="text-amber-400">{foundingCount} founding</span>
          </p>
        </div>
        <a
          href={`data:text/csv;charset=utf-8,${encodeURIComponent(
            ["email,name,company,source,is_founding,coupon_code,created_at",
             ...rows.map((r) =>
               [r.email, r.name ?? "", r.company ?? "", r.source, r.is_founding ? "yes" : "no", r.coupon_code ?? "", r.created_at]
                 .map((s) => `"${String(s).replace(/"/g, '""')}"`)
                 .join(","),
             ),
            ].join("\n"),
          )}`}
          download={`heatrank-waitlist-${new Date().toISOString().slice(0, 10)}.csv`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.10] text-xs font-semibold text-zinc-200 hover:bg-white/[0.10] hover:border-white/[0.18] transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </a>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] border-b border-white/[0.05]">
            <tr className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">
              <th className="px-4 py-2.5 text-left">Email</th>
              <th className="px-4 py-2.5 text-left">Name</th>
              <th className="px-4 py-2.5 text-left">Company</th>
              <th className="px-4 py-2.5 text-left">Tier</th>
              <th className="px-4 py-2.5 text-right">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-xs text-zinc-600">
                  No waitlist signups yet.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-2.5 text-zinc-200">{row.email}</td>
                <td className="px-4 py-2.5 text-zinc-400">{row.name ?? "—"}</td>
                <td className="px-4 py-2.5 text-zinc-400">{row.company ?? "—"}</td>
                <td className="px-4 py-2.5">
                  {row.is_founding ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] font-semibold uppercase tracking-wider">
                      ★ Founding · {row.coupon_code ?? "—"}
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-600">{row.source}</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-zinc-600 text-right text-xs">
                  {new Date(row.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
