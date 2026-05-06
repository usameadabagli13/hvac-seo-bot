import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import BusinessManager from "./BusinessManager";
import Link from "next/link";
import { BarChart3, Tag, MessageSquare, Zap, ChevronRight, MapPin, Code2, Star, CheckCircle2, Circle } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/login");

  const [{ data: businesses }, { count: reviewCount }, { data: recentReviews }, { data: gbpIntegration }] = await Promise.all([
    supabase
      .from("businesses")
      .select("id, business_name, service_location, website_url, target_keywords, is_service_area_business, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("reviews")
      .select("author, rating, body, review_date, businesses(business_name)")
      .eq("user_id", user.id)
      .order("review_date", { ascending: false })
      .limit(3),
    supabase
      .from("integrations")
      .select("id")
      .eq("user_id", user.id)
      .eq("provider", "google_business_profile")
      .maybeSingle(),
  ]);

  // Check if user has run at least one real (non-mock) snapshot
  const bizIds = (businesses ?? []).map((b) => b.id);
  let hasSnapshot = false;
  if (bizIds.length > 0) {
    const { count: snapCount } = await supabase
      .from("rank_snapshots")
      .select("id", { count: "exact", head: true })
      .in("business_id", bizIds)
      .eq("is_mock", false);
    hasSnapshot = (snapCount ?? 0) > 0;
  }

  const activation = {
    hasBusiness: (businesses?.length ?? 0) > 0,
    hasGBP:      !!gbpIntegration,
    hasSnapshot,
  };
  const activationDone = activation.hasBusiness && activation.hasGBP && activation.hasSnapshot;

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

        {/* ── Activation checklist (hidden once all steps done) ────────── */}
        {!activationDone && (
          <div className="mb-10 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-6 py-5">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">
              Getting started
            </p>
            <div className="space-y-3">
              {[
                {
                  done:  activation.hasBusiness,
                  label: "Add your business",
                  cta:   { label: "Add now", href: "#business-form" },
                },
                {
                  done:  activation.hasGBP,
                  label: "Connect Google Business Profile",
                  cta:   { label: "Connect", href: "/reviews" },
                },
                {
                  done:  activation.hasSnapshot,
                  label: "Run your first rank snapshot",
                  cta:   { label: "Run now", href: "/rank" },
                },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  {step.done
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    : <Circle       className="w-4 h-4 text-zinc-700 flex-shrink-0" />
                  }
                  <span className={`flex-1 text-sm ${step.done ? "text-zinc-600 line-through" : "text-zinc-300"}`}>
                    {step.label}
                  </span>
                  {!step.done && (
                    <Link
                      href={step.cta.href}
                      className="text-xs font-semibold text-zinc-400 hover:text-zinc-100 transition-colors"
                    >
                      {step.cta.label} →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: "Businesses", value: businesses?.length ?? 0,  icon: <BarChart3   className="w-4 h-4 text-zinc-400" /> },
            { label: "Keywords",   value: totalKeywords,              icon: <Tag         className="w-4 h-4 text-zinc-400" /> },
            { label: "Reviews",    value: reviewCount ?? 0,           icon: <MessageSquare className="w-4 h-4 text-zinc-400" /> },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 flex items-center gap-4">
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                {stat.icon}
              </div>
              <div>
                <p className="text-xs text-zinc-600 mb-0.5">{stat.label}</p>
                <p className="text-2xl font-semibold text-zinc-300">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Recent reviews (if any) ──────────────────────────────────── */}
        {recentReviews && recentReviews.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Recent Reviews</p>
              <Link href="/reviews" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
                View all →
              </Link>
            </div>
            <div className="space-y-2">
              {recentReviews.map((r, i) => {
                const bizRaw = r.businesses as unknown as { business_name: string } | { business_name: string }[] | null;
                const biz = Array.isArray(bizRaw) ? bizRaw[0] : bizRaw;
                return (
                  <Link key={i} href="/reviews" className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 hover:border-white/[0.10] hover:bg-white/[0.03] transition-colors group">
                    <div className="flex-shrink-0 flex items-center gap-0.5 mt-0.5">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star key={si} className={`w-3 h-3 ${si < r.rating ? "fill-zinc-300 text-zinc-300" : "text-zinc-700"}`} />
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-zinc-300 mb-0.5">{r.author} · <span className="font-normal text-zinc-500">{biz?.business_name ?? "Your Business"}</span></p>
                      <p className="text-xs text-zinc-600 truncate">{r.body}</p>
                    </div>
                    <span className="text-xs text-zinc-700 flex-shrink-0">{r.review_date}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Quick links ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          {[
            { href: "/reviews", icon: MessageSquare, label: "Reviews", desc: "Manage & reply to customer reviews" },
            { href: "/rank",    icon: MapPin,        label: "Rank Tracker", desc: "See where you rank locally" },
            { href: "/schema",  icon: Code2,         label: "Schema Markup", desc: "Generate structured data for Google" },
          ].map(({ href, icon: Icon, label, desc }) => (
            <Link key={href} href={href} className="group rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4 hover:border-white/[0.11] hover:bg-white/[0.04] transition-all duration-150">
              <Icon className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 mb-2 transition-colors" />
              <p className="text-sm font-semibold text-zinc-300 mb-0.5">{label}</p>
              <p className="text-xs text-zinc-600">{desc}</p>
            </Link>
          ))}
        </div>

        <BusinessManager userId={user.id} businesses={businesses ?? []} />
      </main>
    </>
  );
}
