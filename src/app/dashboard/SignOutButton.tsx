"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignOutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <button
      id="sign-out-button"
      onClick={handleSignOut}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:text-zinc-200 hover:border-white/[0.14] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
    >
      {isLoading ? (
        <div className="w-3.5 h-3.5 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
      ) : (
        <svg
          className="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      )}
      Sign Out
    </button>
  );
}
