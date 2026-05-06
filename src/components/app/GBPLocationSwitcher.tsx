"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";

interface GBPLocation {
  name:  string;
  title: string;
}

interface Props {
  initialSelected: string | null;
}

export default function GBPLocationSwitcher({ initialSelected }: Props) {
  const [locations, setLocations] = useState<GBPLocation[] | null>(null);
  const [selected,  setSelected]  = useState<string | null>(initialSelected);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/google/locations")
      .then((r) => r.json())
      .then((data: { locations?: GBPLocation[]; selected?: string | null; error?: string }) => {
        if (cancelled) return;
        if (data.locations) {
          setLocations(data.locations);
          if (data.selected) setSelected(data.selected);
        }
      })
      .catch(() => { /* silent — banner still works without switcher */ });
    return () => { cancelled = true; };
  }, []);

  // Hide entirely if there's only one location (or list hasn't loaded)
  if (!locations || locations.length < 2) return null;

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newName = e.target.value;
    if (newName === selected || switching) return;
    setSwitching(true);
    try {
      const res = await fetch("/api/google/select-location", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ location_name: newName }),
      });
      if (!res.ok) throw new Error("switch failed");
      setSelected(newName);
      // Reload page so server-rendered review list reflects the new location
      window.location.reload();
    } catch {
      setSwitching(false);
    }
  };

  return (
    <div className="relative">
      <select
        value={selected ?? ""}
        onChange={handleChange}
        disabled={switching}
        className="appearance-none pl-3 pr-8 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-medium text-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-400/40 disabled:opacity-60 cursor-pointer"
      >
        {locations.map((l) => (
          <option key={l.name} value={l.name} className="bg-zinc-900 text-zinc-200">
            {l.title}
          </option>
        ))}
      </select>
      {switching
        ? <Loader2     className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-emerald-400 animate-spin pointer-events-none" />
        : <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-emerald-400 pointer-events-none" />
      }
    </div>
  );
}
