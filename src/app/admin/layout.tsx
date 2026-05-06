import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, Mail, Users, AlertTriangle } from "lucide-react";
import { requireAdmin } from "@/lib/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <aside className="hidden lg:flex flex-col w-56 border-r border-white/[0.06] fixed inset-y-0 left-0 z-30">
        <div className="px-4 h-14 flex items-center border-b border-white/[0.06]">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Image src="/heatrank-logo.png" alt="HeatRank AI" width={28} height={28} className="rounded-xl" priority />
            <span className="text-sm font-semibold tracking-tight">
              <span className="text-zinc-100">HeatRank</span>
              <span className="text-amber-400 ml-1">Admin</span>
            </span>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {[
            { href: "/admin",          icon: LayoutDashboard, label: "Overview"  },
            { href: "/admin/users",    icon: Users,           label: "Users"     },
            { href: "/admin/waitlist", icon: Mail,            label: "Waitlist"  },
            { href: "/admin/health",   icon: AlertTriangle,   label: "Health"    },
          ].map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-white/[0.06]">
          <Link href="/dashboard" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
            ← Back to user app
          </Link>
        </div>
      </aside>

      <div className="lg:pl-56">
        {children}
      </div>
    </div>
  );
}
