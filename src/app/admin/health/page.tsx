import type { Metadata } from "next";
import { createAdminClient } from "@/utils/supabase/admin";
import TestEmailButtons from "./TestEmailButtons";

export const metadata: Metadata = { title: "Health — Admin" };
export const revalidate = 60;

interface DodoEvent {
  event_id:     string;
  event_type:   string;
  processed_at: string;
}

export default async function AdminHealthPage() {
  const supabase = createAdminClient();

  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: events30 },
    { data: recentEvents },
  ] = await Promise.all([
    supabase.from("dodo_events").select("event_id", { count: "exact", head: true }).gte("processed_at", since30),
    supabase.from("dodo_events").select("event_id, event_type, processed_at").order("processed_at", { ascending: false }).limit(20),
  ]);

  const events = (recentEvents ?? []) as DodoEvent[];

  // Env presence (server-side, just shows whether they're set, never reveals values)
  const envChecks = [
    { name: "GEMINI_API_KEY",            ok: !!process.env.GEMINI_API_KEY },
    { name: "GOOGLE_PLACES_API_KEY",     ok: !!process.env.GOOGLE_PLACES_API_KEY },
    { name: "GOOGLE_CLIENT_ID",          ok: !!process.env.GOOGLE_CLIENT_ID },
    { name: "GOOGLE_CLIENT_SECRET",      ok: !!process.env.GOOGLE_CLIENT_SECRET },
    { name: "DODO_PAYMENTS_API_KEY",     ok: !!process.env.DODO_PAYMENTS_API_KEY },
    { name: "DODO_PAYMENTS_WEBHOOK_SECRET", ok: !!process.env.DODO_PAYMENTS_WEBHOOK_SECRET },
    { name: "RESEND_API_KEY",            ok: !!process.env.RESEND_API_KEY },
    { name: "RESEND_FROM_EMAIL",         ok: !!process.env.RESEND_FROM_EMAIL },
    { name: "RESEND_WAITLIST_API_KEY",   ok: !!process.env.RESEND_WAITLIST_API_KEY },
    { name: "RESEND_WAITLIST_FROM_EMAIL", ok: !!process.env.RESEND_WAITLIST_FROM_EMAIL },
    { name: "CRON_SECRET",               ok: !!process.env.CRON_SECRET },
    { name: "ADMIN_USER_ID",             ok: !!process.env.ADMIN_USER_ID },
    { name: "SUPABASE_SERVICE_ROLE_KEY", ok: !!process.env.SUPABASE_SERVICE_ROLE_KEY },
    { name: "NEXT_PUBLIC_MAPBOX_TOKEN",  ok: !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN },
  ];

  const missing = envChecks.filter((e) => !e.ok);

  return (
    <main className="relative max-w-5xl mx-auto px-6 py-12">
      <div className="mb-8">
        <p className="text-xs font-medium text-amber-400 uppercase tracking-widest mb-2">Admin</p>
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">System Health</h1>
        <p className="mt-1.5 text-sm text-zinc-500">Env status, recent webhook deliveries.</p>
      </div>

      {/* Env */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
          Environment variables {missing.length > 0 && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/25 text-rose-400 text-[10px]">
              {missing.length} missing
            </span>
          )}
        </p>
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] divide-y divide-white/[0.05]">
          {envChecks.map((e) => (
            <div key={e.name} className="px-4 py-2.5 flex items-center justify-between">
              <code className="text-xs font-mono text-zinc-300">{e.name}</code>
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${e.ok ? "text-emerald-400" : "text-rose-400"}`}>
                {e.ok ? "OK" : "MISSING"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Test email diagnostics */}
      <div className="mb-8">
        <TestEmailButtons />
      </div>

      {/* Webhook deliveries */}
      <div>
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
          Dodo webhooks · {events30 ?? 0} in last 30 days
        </p>
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] border-b border-white/[0.05]">
              <tr className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">
                <th className="px-4 py-2.5 text-left">Event ID</th>
                <th className="px-4 py-2.5 text-left">Type</th>
                <th className="px-4 py-2.5 text-right">Processed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {events.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-xs text-zinc-600">
                    No webhook events recorded yet.
                  </td>
                </tr>
              )}
              {events.map((e) => (
                <tr key={e.event_id}>
                  <td className="px-4 py-2.5">
                    <code className="text-[10px] font-mono text-zinc-500">{e.event_id.slice(0, 24)}…</code>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-300 text-xs">{e.event_type}</td>
                  <td className="px-4 py-2.5 text-zinc-600 text-right text-xs">
                    {new Date(e.processed_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
