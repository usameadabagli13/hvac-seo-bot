import type { Metadata } from "next";
import { createAdminClient } from "@/utils/supabase/admin";

export const metadata: Metadata = { title: "Users — Admin" };
export const dynamic = "force-dynamic";

interface ProfileRow {
  user_id:       string;
  full_name:     string | null;
  plan:          string | null;
  trial_ends_at: string | null;
  created_at:    string;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = createAdminClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, full_name, plan, trial_ends_at, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  // Pull emails in one batched call
  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const emailById = new Map<string, string>();
  for (const u of users) emailById.set(u.id, u.email ?? "");

  const rows = (profiles ?? []) as ProfileRow[];
  const search = q?.trim().toLowerCase() ?? "";
  const filtered = search
    ? rows.filter((r) => {
        const email = emailById.get(r.user_id) ?? "";
        return (
          email.toLowerCase().includes(search) ||
          (r.full_name ?? "").toLowerCase().includes(search) ||
          r.user_id.toLowerCase().includes(search)
        );
      })
    : rows;

  return (
    <main className="relative max-w-5xl mx-auto px-6 py-12">
      <div className="mb-8">
        <p className="text-xs font-medium text-amber-400 uppercase tracking-widest mb-2">Admin</p>
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Users</h1>
        <p className="mt-1.5 text-sm text-zinc-500">Most-recent 100 profiles. Search filters them client-side.</p>
      </div>

      <form className="mb-5">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search email, name, or user_id…"
          className="w-full max-w-sm rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-white/20"
        />
      </form>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] border-b border-white/[0.05]">
            <tr className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">
              <th className="px-4 py-2.5 text-left">Email</th>
              <th className="px-4 py-2.5 text-left">Name</th>
              <th className="px-4 py-2.5 text-left">Plan</th>
              <th className="px-4 py-2.5 text-left">Trial</th>
              <th className="px-4 py-2.5 text-right">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-xs text-zinc-600">
                  No users match.
                </td>
              </tr>
            )}
            {filtered.map((p) => {
              const email = emailById.get(p.user_id) ?? "(no email)";
              const trialActive = p.trial_ends_at && new Date(p.trial_ends_at) > new Date();
              return (
                <tr key={p.user_id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-2.5 text-zinc-200">{email}</td>
                  <td className="px-4 py-2.5 text-zinc-400">{p.full_name ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs ${
                      p.plan === "agency" ? "text-amber-400" :
                      p.plan === "pro"    ? "text-emerald-400" :
                      "text-zinc-500"
                    }`}>
                      {p.plan ?? "starter"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    {trialActive ? (
                      <span className="text-amber-400">
                        ends {new Date(p.trial_ends_at!).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-zinc-600 text-right text-xs">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
