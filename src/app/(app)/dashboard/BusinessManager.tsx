"use client";

import { useState } from "react";
import Link from "next/link";
import { BarChart3, Pencil, X, ExternalLink } from "lucide-react";
import BusinessForm from "./BusinessForm";

export interface Business {
  id: string;
  business_name: string;
  service_location: string;
  website_url: string | null;
  target_keywords: string[] | null;
  is_service_area_business: boolean | null;
  created_at: string;
}

export default function BusinessManager({
  userId,
  businesses,
}: {
  userId: string;
  businesses: Business[];
}) {
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* ── Form Column ───────────────────────────────────────────────── */}
      <div className="lg:col-span-3">
        <BusinessForm
          userId={userId}
          editingBusiness={editingBusiness}
          onSaved={() => setEditingBusiness(null)}
          onCancelEdit={() => setEditingBusiness(null)}
        />
      </div>

      {/* ── Businesses List Column ────────────────────────────────────── */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-widest">
          Saved Businesses
        </h2>

        {businesses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.07] bg-white/[0.01] px-5 py-10 flex flex-col items-center text-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-zinc-700" />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 mb-1">No businesses yet</p>
              <p className="text-[11px] text-zinc-700 leading-relaxed">
                Fill in the form on the left and click<br />&ldquo;Start Analysis&rdquo; to add your first one.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
            {businesses.map((biz) => {
              const isEditing = editingBusiness?.id === biz.id;
              return (
                <div
                  key={biz.id}
                  className={`rounded-xl border bg-white/[0.02] px-4 py-3.5 transition-colors duration-200 ${
                    isEditing
                      ? "border-white/[0.18] bg-white/[0.04]"
                      : "border-white/[0.07] hover:border-white/[0.12]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-zinc-200 truncate">
                        {biz.business_name}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {biz.service_location}
                      </p>
                      {biz.website_url && (
                        <a
                          href={biz.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors truncate block mt-1"
                        >
                          {biz.website_url}
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Link
                        href={`/dashboard/businesses/${biz.id}`}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border bg-white/[0.03] border-white/[0.07] text-zinc-600 hover:text-zinc-300 hover:border-white/[0.12] transition-all duration-150"
                        aria-label={`View details for ${biz.business_name}`}
                      >
                        <ExternalLink className="w-3 h-3" /> View
                      </Link>
                      <button
                        onClick={() => setEditingBusiness(isEditing ? null : biz)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all duration-150 ${
                          isEditing
                            ? "bg-white/[0.06] border-white/[0.12] text-zinc-300 hover:text-zinc-100"
                            : "bg-white/[0.03] border-white/[0.07] text-zinc-600 hover:text-zinc-300 hover:border-white/[0.12]"
                        }`}
                        aria-label={isEditing ? "Cancel editing" : `Edit ${biz.business_name}`}
                      >
                        {isEditing ? (
                          <><X className="w-3 h-3" /> Cancel</>
                        ) : (
                          <><Pencil className="w-3 h-3" /> Edit</>
                        )}
                      </button>
                    </div>
                  </div>

                  {Array.isArray(biz.target_keywords) && biz.target_keywords.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(biz.target_keywords as string[]).slice(0, 5).map((kw, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-700/40 border border-zinc-600/30 text-[10px] text-zinc-400"
                        >
                          {kw}
                        </span>
                      ))}
                      {biz.target_keywords.length > 5 && (
                        <span className="text-[10px] text-zinc-600 self-center">
                          +{biz.target_keywords.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
