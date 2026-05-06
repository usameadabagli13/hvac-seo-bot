"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  Globe,
  Calendar,
  Pencil,
  Check,
  X,
  Loader2,
  Truck,
  Trash2,
} from "lucide-react";

interface BusinessHeaderProps {
  business: {
    id:                          string;
    business_name:               string;
    service_location:            string;
    website_url:                 string | null;
    is_service_area_business:    boolean | null;
    created_at:                  string;
  };
}

export default function EditableBusinessHeader({ business }: BusinessHeaderProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const [name,    setName]    = useState(business.business_name);
  const [loc,     setLoc]     = useState(business.service_location);
  const [url,     setUrl]     = useState(business.website_url ?? "");
  const [sab,     setSab]     = useState(!!business.is_service_area_business);

  const handleCancel = () => {
    setName(business.business_name);
    setLoc(business.service_location);
    setUrl(business.website_url ?? "");
    setSab(!!business.is_service_area_business);
    setError(null);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${business.business_name}"? Reviews, snapshots, and audits stay attached but the business is hidden from your dashboard. This is reversible — contact support to restore.`)) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/businesses", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ id: business.id, deleted_at: true }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed to delete.");
        return;
      }
      // Send the user back to the dashboard since this business no longer exists
      window.location.href = "/dashboard";
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !loc.trim()) {
      setError("Business name and service location are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/businesses", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          id:                          business.id,
          business_name:               name.trim(),
          service_location:            loc.trim(),
          website_url:                 url.trim() || null,
          is_service_area_business:    sab,
        }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed to save.");
        return;
      }
      setEditing(false);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div className="mb-8 flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
          <Building2 className="w-5 h-5 text-zinc-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
              {business.business_name}
            </h1>
            <button
              onClick={() => setEditing(true)}
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/[0.08] bg-white/[0.02] text-xs text-zinc-400 hover:text-zinc-100 hover:border-white/[0.18] transition-colors"
            >
              <Pencil className="w-3 h-3" />
              Edit
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
            <span className="flex items-center gap-1 text-xs text-zinc-500">
              <MapPin className="w-3 h-3" />
              {business.service_location}
            </span>
            {business.website_url && (
              <a
                href={business.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <Globe className="w-3 h-3" />
                {business.website_url}
              </a>
            )}
            {business.is_service_area_business && (
              <span className="flex items-center gap-1 text-xs text-zinc-500">
                <Truck className="w-3 h-3" />
                Service area business
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-zinc-600">
              <Calendar className="w-3 h-3" />
              Added{" "}
              {new Date(business.created_at).toLocaleDateString("en-US", {
                month: "short",
                day:   "numeric",
                year:  "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── Edit mode ──────────────────────────────────────────────────────────────
  return (
    <div className="mb-8 rounded-2xl border border-white/[0.10] bg-white/[0.02] p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
          Edit Business
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCancel}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors disabled:opacity-40"
          >
            <X className="w-3 h-3" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-100 active:scale-[0.97] transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-[11px] uppercase tracking-wider text-zinc-600 mb-1.5">Business name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-white/20"
            placeholder="Acme HVAC"
          />
        </label>
        <label className="block">
          <span className="block text-[11px] uppercase tracking-wider text-zinc-600 mb-1.5">Service location</span>
          <input
            type="text"
            value={loc}
            onChange={(e) => setLoc(e.target.value)}
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-white/20"
            placeholder="Dallas, TX"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="block text-[11px] uppercase tracking-wider text-zinc-600 mb-1.5">Website URL <span className="text-zinc-700 normal-case tracking-normal">(optional)</span></span>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-white/20"
            placeholder="https://yoursite.com"
          />
        </label>
      </div>

      <label className="flex items-start gap-2.5 cursor-pointer select-none rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 hover:border-white/[0.12] transition-colors">
        <input
          type="checkbox"
          checked={sab}
          onChange={(e) => setSab(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-emerald-500 cursor-pointer flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-sm font-medium text-zinc-200">Service area business</span>
          </div>
          <p className="text-[11px] text-zinc-600 mt-0.5">No physical storefront — you travel to customer locations.</p>
        </div>
      </label>

      {error && (
        <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Danger zone */}
      <div className="pt-3 mt-1 border-t border-white/[0.05] flex items-center justify-between gap-3">
        <p className="text-[11px] text-zinc-600">
          Hide this business from your dashboard. Linked data is preserved.
        </p>
        <button
          type="button"
          onClick={handleDelete}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors disabled:opacity-40"
        >
          <Trash2 className="w-3 h-3" />
          Delete business
        </button>
      </div>
    </div>
  );
}
