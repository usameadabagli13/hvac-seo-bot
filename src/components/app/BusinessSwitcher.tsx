"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

interface Business {
  id:            string;
  business_name: string;
}

interface Props {
  businesses: Business[];
  selectedId: string;
  paramName?: string;
}

export default function BusinessSwitcher({ businesses, selectedId, paramName = "business" }: Props) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  if (businesses.length < 2) return null;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, e.target.value);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
        Business
      </label>
      <div className="relative max-w-xs">
        <select
          value={selectedId}
          onChange={handleChange}
          className="w-full appearance-none px-4 py-2.5 pr-9 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-zinc-200 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all duration-200"
        >
          {businesses.map((b) => (
            <option key={b.id} value={b.id} className="bg-zinc-900 text-zinc-200">
              {b.business_name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
      </div>
    </div>
  );
}
