import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import BusinessManager from "./BusinessManager";
import { BarChart3, Tag, FileText, Zap, ChevronRight } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: businesses } = await supabase
    .from("businesses")
    .select("id, business_name, service_location, website_url, target_keywords, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const totalKeywords = (businesses ?? []).reduce(
    (sum, b) => sum + (Array.isArray(b.target_keywords) ? b.target_keywords.length : 0),
    0
  );

  return (
    <>
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-zinc-700/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-zinc-800/8 rounded-full blur-[120px]" />
      </div>

      {/* Main */}
      <main className="relative max-w-5xl mx-auto px-6 py-12">
        {/* Page heading */}
        <div className="mb-10">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-2">
            Dashboard
          </p>
          <h1 className="text-3xl font-semibold text-zinc-100 tracking-tight">
            HeatRank AI Command Center
          </h1>
          <p className="mt-2 text-sm text-zinc-500 max-w-lg">
            Add your HVAC businesses, generate AI‑powered local keywords, and
            kick off SEO analysis — all in one place.
          </p>
        </div>

        {/* ── Empty-state welcome banner (new users only) ─────────────── */}
        {(!businesses || businesses.length === 0) && (
          <div className="mb-10 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
              <Zap className="w-5 h-5 text-zinc-300" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-zinc-100 mb-1">
                Welcome — let&apos;s get you ranked
              </h2>
              <p className="text-sm text-zinc-500 leading-relaxed max-w-md">
                Add your first HVAC business to generate AI‑powered local keywords,
                run an SEO audit, and start tracking your Google rankings.
                Takes under 2 minutes.
              </p>
            </div>
            <a
              href="#business-form"
              className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100 active:scale-[0.98] transition-all duration-150 shadow-lg shadow-black/20"
            >
              Add Business
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            {
              label: "Businesses Added",
              value: businesses?.length ?? 0,
              icon: <BarChart3 className="w-4 h-4 text-zinc-400" />,
            },
            {
              label: "Keywords Tracked",
              value: totalKeywords,
              icon: <Tag className="w-4 h-4 text-zinc-400" />,
            },
            {
              label: "Reports Generated",
              value: "—",
              icon: <FileText className="w-4 h-4 text-zinc-500" />,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 flex items-center gap-4"
            >
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                {stat.icon}
              </div>
              <div>
                <p className="text-xs text-zinc-600 mb-0.5">{stat.label}</p>
                <p className="text-2xl font-semibold text-zinc-300">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <BusinessManager userId={user!.id} businesses={businesses ?? []} />
      </main>
    </>
  );
}
