import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Sidebar from "@/components/app/Sidebar";

// Single auth guard for every route under (app)/.
// Individual pages still receive `user` from their own supabase.auth.getUser()
// calls when they need it — this guard just ensures the session always exists.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Sidebar />
      {/* lg:pl-56 offsets the fixed sidebar; pb-16 clears the mobile bottom nav */}
      <div className="lg:pl-56 pb-16 lg:pb-0">
        {children}
      </div>
    </div>
  );
}
