import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import SchemaGenerator from "@/components/app/SchemaGenerator";
import BusinessSwitcher from "@/components/app/BusinessSwitcher";

export const metadata: Metadata = {
  title: "Schema Markup — HeatRank AI",
};

export default async function SchemaPage({
  searchParams,
}: {
  searchParams: Promise<{ business?: string }>;
}) {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/login");

  const { data: businesses } = await supabase
    .from("businesses")
    .select("id, business_name, service_location, website_url, target_keywords")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const { business: selectedIdParam } = await searchParams;
  const selectedId =
    (selectedIdParam && businesses?.find((b) => b.id === selectedIdParam)?.id) ||
    businesses?.[0]?.id ||
    "";

  return (
    <>
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[500px] bg-zinc-700/8 rounded-full blur-[130px]" />
      </div>

      <main className="relative max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2">
            Tools
          </p>
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
            JSON-LD Schema Generator
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500 max-w-xl leading-relaxed">
            Generate <code className="px-1.5 py-0.5 rounded bg-white/[0.05] text-zinc-300 text-xs font-mono">LocalBusiness</code> +{" "}
            <code className="px-1.5 py-0.5 rounded bg-white/[0.05] text-zinc-300 text-xs font-mono">HVACBusiness</code> structured data
            for your website. Schema markup helps Google understand your business and can
            improve local pack visibility.
          </p>
        </div>

        {(businesses ?? []).length > 1 && (
          <div className="mb-6">
            <BusinessSwitcher businesses={businesses ?? []} selectedId={selectedId} />
          </div>
        )}

        <SchemaGenerator businesses={businesses ?? []} selectedId={selectedId} />
      </main>
    </>
  );
}
