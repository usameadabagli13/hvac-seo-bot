"use client";

// ssr:false must live in a Client Component (Next.js 16 requirement).
import dynamic from "next/dynamic";
import type { HeatmapPoint } from "./RankMap";

const RankMapInner = dynamic(() => import("./RankMap"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.01] h-[60vh] max-h-[500px] flex items-center justify-center">
      <p className="text-sm text-zinc-600 animate-pulse">Loading map…</p>
    </div>
  ),
});

interface Props {
  keyword:      string;
  snapshotDate: string;
  points:       HeatmapPoint[];
  businessId:   string;
  centerLat:    number;
  centerLng:    number;
  isMock:       boolean;
  gbpConnected: boolean;
}

export default function RankMapLoader(props: Props) {
  return <RankMapInner {...props} />;
}
