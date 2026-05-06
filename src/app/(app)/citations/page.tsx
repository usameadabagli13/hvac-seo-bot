import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import BusinessSwitcher from "@/components/app/BusinessSwitcher";
import CitationsClient from "./CitationsClient";

export const metadata: Metadata = {
  title: "NAP Citations — HeatRank AI",
};

interface RawCitation {
  id:               string;
  directory:        string;
  listing_url:      string;
  detected_name:    string | null;
  detected_address: string | null;
  detected_phone:   string | null;
  nap_consistent:   boolean;
  diff:             unknown;
  last_checked_at:  string;
}

export default async function CitationsPage({
  searchParams,
}: {
  searchParams: Promise<{ business?: string }>;
}) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: businesses } = await supabase
    .from("businesses")
    .select("id, business_name, phone, street_address")
    .eq("user_id", session.user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const { business: selectedIdParam } = await searchParams;
  const biz =
    (selectedIdParam && businesses?.find((b) => b.id === selectedIdParam)) ||
    businesses?.[0] ||
    null;

  let citations: RawCitation[] = [];
  if (biz) {
    const { data } = await supabase
      .from("citations")
      .select("id, directory, listing_url, detected_name, detected_address, detected_phone, nap_consistent, diff, last_checked_at")
      .eq("business_id", biz.id)
      .order("last_checked_at", { ascending: false });
    citations = (data ?? []) as RawCitation[];
  }

  const consistentCount = citations.filter((c) => c.nap_consistent).length;
  const napReady = !!biz?.phone && !!biz?.street_address;

  return (
    <main className="relative max-w-4xl mx-auto px-6 py-12">
      <div className="mb-8">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2">
          Local SEO
        </p>
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
          NAP Citation Manager
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500 max-w-xl leading-relaxed">
          Track how your Name, Address, and Phone appear across business directories.
          Inconsistent NAP is a top-3 reason local listings underperform.
        </p>
      </div>

      {!biz ? (
        <div className="rounded-2xl border border-dashed border-white/[0.07] bg-white/[0.01] px-6 py-14 text-center">
          <p className="text-sm text-zinc-500 mb-1">No businesses added yet.</p>
          <p className="text-xs text-zinc-700">
            <Link href="/dashboard" className="underline hover:text-zinc-500">Add a business</Link>{" "}
            and set its phone + address before scanning citations.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <BusinessSwitcher businesses={businesses ?? []} selectedId={biz.id} />

          {/* Canonical NAP card */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-4">
            <p className="text-[11px] uppercase tracking-widest text-zinc-600 mb-2">Your canonical NAP</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-[10px] text-zinc-700 uppercase tracking-wide mb-0.5">Name</p>
                <p className="text-zinc-200">{biz.business_name}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-700 uppercase tracking-wide mb-0.5">Phone</p>
                <p className={biz.phone ? "text-zinc-200" : "text-rose-400"}>
                  {biz.phone ?? "Not set"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-700 uppercase tracking-wide mb-0.5">Address</p>
                <p className={biz.street_address ? "text-zinc-200" : "text-rose-400"}>
                  {biz.street_address ?? "Not set"}
                </p>
              </div>
            </div>
            {!napReady && (
              <p className="mt-3 text-[11px] text-amber-400">
                Set phone + street address on the business detail page before scanning.
              </p>
            )}
          </div>

          <CitationsClient
            businessId={biz.id}
            citations={citations}
            consistentCount={consistentCount}
            napReady={napReady}
          />
        </div>
      )}
    </main>
  );
}
