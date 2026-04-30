import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import SignOutButton from "./SignOutButton";
import BusinessForm from "./BusinessForm";
import { BarChart3, Tag, FileText } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch existing businesses for this user
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
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-indigo-900/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-900/8 rounded-full blur-[120px]" />
      </div>

      {/* Top nav */}
      <header className="relative border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-white/[0.05] border border-white/[0.10]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-3.5 h-3.5 text-zinc-400"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-sm font-medium text-zinc-300">
              HVAC SEO Bot
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* User pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.07]">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[10px] font-bold text-white select-none">
                {user.email?.[0].toUpperCase() ?? "?"}
              </div>
              <span className="text-xs text-zinc-400 max-w-[160px] truncate">
                {user.email}
              </span>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative max-w-5xl mx-auto px-6 py-12">
        {/* Page heading */}
        <div className="mb-10">
          <p className="text-xs font-medium text-indigo-400 uppercase tracking-widest mb-2">
            Dashboard
          </p>
          <h1 className="text-3xl font-semibold text-zinc-100 tracking-tight">
            HVAC SEO Command Center
          </h1>
          <p className="mt-2 text-sm text-zinc-500 max-w-lg">
            Add your HVAC businesses, generate AI‑powered local keywords, and
            kick off SEO analysis — all in one place.
          </p>
        </div>

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

        {/* Two-column layout on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ── Form Column ──────────────────────────────────────────── */}
          <div className="lg:col-span-3">
            <BusinessForm userId={user!.id} />
          </div>

          {/* ── Businesses List Column ───────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-widest">
              Saved Businesses
            </h2>

            {!businesses || businesses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/[0.07] bg-white/[0.01] px-5 py-8 text-center">
                <p className="text-xs text-zinc-600">
                  No businesses yet. Fill in the form to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
                {businesses.map((biz) => (
                  <div
                    key={biz.id}
                    className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3.5 hover:border-white/[0.12] transition-colors duration-200"
                  >
                    <p className="text-sm font-semibold text-zinc-200 truncate">
                      {biz.business_name}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {biz.service_location}
                    </p>
                    {biz.website_url && (
                      <a
                        href={biz.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-indigo-500 hover:text-indigo-400 transition-colors truncate block mt-1"
                      >
                        {biz.website_url}
                      </a>
                    )}
                    {Array.isArray(biz.target_keywords) && biz.target_keywords.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {(biz.target_keywords as string[]).slice(0, 5).map((kw, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/15 text-[10px] text-indigo-400"
                          >
                            {kw}
                          </span>
                        ))}
                        {biz.target_keywords.length > 5 && (
                          <span className="text-[10px] text-zinc-600 self-center">
                            +{biz.target_keywords.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
