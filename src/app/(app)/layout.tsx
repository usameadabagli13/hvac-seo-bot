import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Sidebar from "@/components/app/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("user_id", session.user.id)
    .maybeSingle();

  const plan = (profile?.plan as "starter" | "pro" | "agency") ?? "starter";

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Sidebar plan={plan} />
      {/* lg:pl-56 offsets the fixed sidebar; pb-16 clears the mobile bottom nav */}
      <div className="lg:pl-56 pb-16 lg:pb-0">
        {children}
      </div>
    </div>
  );
}
