import Sidebar from "@/components/app/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
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
