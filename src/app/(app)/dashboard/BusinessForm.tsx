"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Building2,
  MapPin,
  Globe,
  Sparkles,
  Plus,
  X,
  Loader2,
  Tag,
  ChevronRight,
  CheckCircle2,
  Pencil,
} from "lucide-react";
import type { Business } from "./BusinessManager";

// ── Top US cities for location autocomplete ──────────────────────────────────
const US_CITIES = [
  "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX",
  "Phoenix, AZ", "Philadelphia, PA", "San Antonio, TX", "San Diego, CA",
  "Dallas, TX", "San Jose, CA", "Austin, TX", "Jacksonville, FL",
  "Fort Worth, TX", "Columbus, OH", "Charlotte, NC", "Indianapolis, IN",
  "San Francisco, CA", "Seattle, WA", "Denver, CO", "Nashville, TN",
  "Oklahoma City, OK", "El Paso, TX", "Washington, DC", "Las Vegas, NV",
  "Louisville, KY", "Memphis, TN", "Portland, OR", "Baltimore, MD",
  "Milwaukee, WI", "Albuquerque, NM", "Tucson, AZ", "Fresno, CA",
  "Sacramento, CA", "Mesa, AZ", "Kansas City, MO", "Atlanta, GA",
  "Omaha, NE", "Colorado Springs, CO", "Raleigh, NC", "Long Beach, CA",
  "Virginia Beach, VA", "Minneapolis, MN", "Tampa, FL", "New Orleans, LA",
  "Arlington, TX", "Bakersfield, CA", "Honolulu, HI", "Anaheim, CA",
  "Aurora, CO", "Santa Ana, CA", "Corpus Christi, TX", "Riverside, CA",
  "Lexington, KY", "St. Louis, MO", "Pittsburgh, PA", "Stockton, CA",
  "Anchorage, AK", "Cincinnati, OH", "St. Paul, MN", "Greensboro, NC",
  "Toledo, OH", "Newark, NJ", "Plano, TX", "Henderson, NV",
  "Orlando, FL", "Lincoln, NE", "Jersey City, NJ", "Chandler, AZ",
  "St. Petersburg, FL", "Laredo, TX", "Norfolk, VA", "Madison, WI",
  "Durham, NC", "Lubbock, TX", "Winston-Salem, NC", "Garland, TX",
  "Glendale, AZ", "Hialeah, FL", "Reno, NV", "Baton Rouge, LA",
  "Irvine, CA", "Chesapeake, VA", "Irving, TX", "Scottsdale, AZ",
  "North Las Vegas, NV", "Fremont, CA", "Gilbert, AZ", "San Bernardino, CA",
  "Boise, ID", "Birmingham, AL", "Rochester, NY", "Richmond, VA",
  "Spokane, WA", "Des Moines, IA", "Montgomery, AL", "Modesto, CA",
  "Fayetteville, NC", "Tacoma, WA", "Shreveport, LA", "Akron, OH",
];

interface FormState {
  business_name: string;
  service_location: string;
  website_url: string;
}

// ── LocationInput ─────────────────────────────────────────────────────────────
function LocationInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter cities on keystroke
  useEffect(() => {
    const q = value.trim().toLowerCase();
    if (q.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    const filtered = US_CITIES.filter((c) => c.toLowerCase().includes(q)).slice(0, 8);
    setSuggestions(filtered);
    setOpen(filtered.length > 0);
    setActiveIdx(-1);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (city: string) => {
    onChange(city);
    setOpen(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      select(suggestions[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        id="service_location"
        name="service_location"
        type="text"
        required
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder="e.g. Dallas, TX"
        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all duration-200"
      />

      {/* Dropdown */}
      {open && (
        <ul
          role="listbox"
          className="absolute z-30 mt-1.5 w-full rounded-xl border border-white/[0.08] bg-zinc-900 shadow-2xl shadow-black/60 overflow-hidden"
        >
          {suggestions.map((city, idx) => (
            <li
              key={city}
              role="option"
              aria-selected={idx === activeIdx}
              onMouseDown={() => select(city)}
              onMouseEnter={() => setActiveIdx(idx)}
              className={`flex items-center gap-2.5 px-4 py-2.5 cursor-pointer text-sm transition-colors duration-100 ${
                idx === activeIdx
                  ? "bg-white/[0.08] text-zinc-100"
                  : "text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200"
              }`}
            >
              <MapPin className="w-3 h-3 flex-shrink-0 text-zinc-600" />
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── BusinessForm ──────────────────────────────────────────────────────────────
export default function BusinessForm({
  userId,
  editingBusiness = null,
  onSaved,
  onCancelEdit,
}: {
  userId: string;
  editingBusiness?: Business | null;
  onSaved?: () => void;
  onCancelEdit?: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    business_name: "",
    service_location: "",
    website_url: "",
  });

  const [keywords, setKeywords] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Sync form fields when the editing target changes
  useEffect(() => {
    if (editingBusiness) {
      setForm({
        business_name: editingBusiness.business_name,
        service_location: editingBusiness.service_location,
        website_url: editingBusiness.website_url ?? "",
      });
      setKeywords(
        Array.isArray(editingBusiness.target_keywords)
          ? (editingBusiness.target_keywords as string[])
          : []
      );
    } else {
      setForm({ business_name: "", service_location: "", website_url: "" });
      setKeywords([]);
    }
    setError(null);
    setSaveSuccess(false);
    setTagInput("");
  }, [editingBusiness]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ── AI Keyword Generation ──────────────────────────────────────────────────
  const handleGenerateKeywords = async () => {
    if (!form.business_name.trim() || !form.service_location.trim()) {
      setAiError("Please fill in Business Name and Service Location first.");
      return;
    }
    setAiError(null);
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: form.business_name,
          location: form.service_location,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");

      // Merge without duplicates (case-insensitive)
      const existing = new Set(keywords.map((k) => k.toLowerCase()));
      const fresh = (data.keywords as string[]).filter(
        (k) => !existing.has(k.toLowerCase())
      );
      setKeywords((prev) => [...prev, ...fresh]);
    } catch (err: unknown) {
      setAiError(
        err instanceof Error ? err.message : "Failed to generate keywords."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Manual Tag Input ───────────────────────────────────────────────────────
  const addTag = (value: string) => {
    const tag = value.trim();
    if (!tag) return;
    if (keywords.some((k) => k.toLowerCase() === tag.toLowerCase())) return;
    setKeywords((prev) => [...prev, tag]);
    setTagInput("");
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && tagInput === "" && keywords.length) {
      setKeywords((prev) => prev.slice(0, -1));
    }
  };

  const removeKeyword = (index: number) => {
    setKeywords((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Save to Supabase ───────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.business_name.trim()) {
      setError("Business name is required.");
      return;
    }
    if (!form.service_location.trim()) {
      setError("Service location is required.");
      return;
    }

    if (form.website_url.trim()) {
      try {
        const raw = form.website_url.trim();
        new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
      } catch {
        setError("Please enter a valid website URL (e.g. https://yoursite.com).");
        return;
      }
    }

    setIsSaving(true);
    try {
      const supabase = createClient();

      const fields = {
        business_name: form.business_name.trim(),
        service_location: form.service_location.trim(),
        website_url: form.website_url.trim() || null,
        target_keywords: keywords,
      };

      if (editingBusiness) {
        console.log("[BusinessForm] Updating business:", editingBusiness.id, fields);
        const { error: dbError } = await supabase
          .from("businesses")
          .update(fields)
          .eq("id", editingBusiness.id)
          .eq("user_id", userId);
        if (dbError) throw dbError;
      } else {
        console.log("[BusinessForm] Inserting new business:", fields);
        const { error: dbError } = await supabase
          .from("businesses")
          .insert({ ...fields, user_id: userId });
        if (dbError) throw dbError;
      }

      setSaveSuccess(true);
      router.refresh();
      setTimeout(() => {
        setSaveSuccess(false);
        onSaved?.();
        if (!editingBusiness) {
          setForm({ business_name: "", service_location: "", website_url: "" });
          setKeywords([]);
        }
      }, 1500);
    } catch (err: unknown) {
      const e = err as Record<string, unknown>;
      console.error("[BusinessForm] DB error:", e?.["message"] ?? err);
      const msg =
        err instanceof Error
          ? err.message
          : (e?.["message"] as string) || "Failed to save. Please try again.";
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      id="business-form"
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden"
    >
      {/* ── Form Header ───────────────────────────────────────────────── */}
      <div className="px-6 pt-6 pb-5 border-b border-white/[0.06]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              {editingBusiness ? (
                <Pencil className="w-4 h-4 text-zinc-300" />
              ) : (
                <Building2 className="w-4 h-4 text-zinc-300" />
              )}
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100">
                {editingBusiness ? "Edit Business" : "Add New Business"}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {editingBusiness
                  ? `Editing: ${editingBusiness.business_name}`
                  : "Set up your HVAC business profile and seed keywords"}
              </p>
            </div>
          </div>
          {editingBusiness && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-150"
            >
              <X className="w-3 h-3" />
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="px-6 py-6 space-y-5">
        {/* ── Business Name ─────────────────────────────────────────── */}
        <div className="space-y-1.5">
          <label
            htmlFor="business_name"
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 uppercase tracking-wider"
          >
            <Building2 className="w-3 h-3" />
            Business Name
            <span className="text-rose-500">*</span>
          </label>
          <input
            id="business_name"
            name="business_name"
            type="text"
            required
            value={form.business_name}
            onChange={handleChange}
            placeholder="e.g. Arctic Air HVAC Services"
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all duration-200"
          />
        </div>

        {/* ── Service Location (with autocomplete) ──────────────────── */}
        <div className="space-y-1.5">
          <label
            htmlFor="service_location"
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 uppercase tracking-wider"
          >
            <MapPin className="w-3 h-3" />
            Service Location
            <span className="text-rose-500">*</span>
          </label>
          <LocationInput
            value={form.service_location}
            onChange={(val) =>
              setForm((prev) => ({ ...prev, service_location: val }))
            }
          />
        </div>

        {/* ── Website URL ───────────────────────────────────────────── */}
        <div className="space-y-1.5">
          <label
            htmlFor="website_url"
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 uppercase tracking-wider"
          >
            <Globe className="w-3 h-3" />
            Website URL
            <span className="text-zinc-600 font-normal normal-case ml-1">
              (optional)
            </span>
          </label>
          <input
            id="website_url"
            name="website_url"
            type="url"
            value={form.website_url}
            onChange={handleChange}
            placeholder="https://yourwebsite.com"
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all duration-200"
          />
        </div>

        {/* ── Divider ───────────────────────────────────────────────── */}
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.05]" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-zinc-950 text-[11px] text-zinc-600 uppercase tracking-widest">
              Keywords
            </span>
          </div>
        </div>

        {/* ── AI Generate Button ────────────────────────────────────── */}
        <div>
          <button
            id="generate-keywords-btn"
            type="button"
            onClick={handleGenerateKeywords}
            disabled={isGenerating}
            className={[
              "relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl",
              "text-sm font-medium select-none",
              "bg-zinc-800/80 text-zinc-100",
              "border border-white/[0.10]",
              "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07)]",
              "hover:bg-zinc-700/80 hover:border-white/[0.15] hover:text-white",
              "active:scale-[0.97] active:bg-zinc-800",
              "transition-all duration-150",
              "disabled:opacity-40 disabled:pointer-events-none",
            ].join(" ")}
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
            )}
            <span>{isGenerating ? "Generating…" : "Generate Keywords with AI"}</span>
          </button>
        </div>

        {aiError && (
          <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
            {aiError}
          </p>
        )}

        {/* ── Keyword Tags ──────────────────────────────────────────── */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">
            <Tag className="w-3 h-3" />
            Keywords
            {keywords.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-zinc-400 text-[10px] font-semibold tabular-nums">
                {keywords.length}
              </span>
            )}
          </label>

          {/* Tag container */}
          <div
            onClick={() => tagInputRef.current?.focus()}
            className="min-h-[56px] w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-wrap gap-2 cursor-text focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/10 transition-all duration-200"
          >
            {keywords.map((kw, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/[0.09] text-xs text-zinc-300 font-medium"
              >
                {kw}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeKeyword(i);
                  }}
                  className="text-zinc-500 hover:text-rose-400 transition-colors duration-150"
                  aria-label={`Remove ${kw}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              ref={tagInputRef}
              id="tag-input"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={() => addTag(tagInput)}
              placeholder={
                keywords.length === 0 ? "Type a keyword and press Enter…" : ""
              }
              className="flex-1 min-w-[160px] bg-transparent text-sm text-zinc-300 placeholder:text-zinc-600 outline-none"
            />
          </div>
          <p className="text-[11px] text-zinc-600">
            Press{" "}
            <kbd className="px-1 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-zinc-500 text-[10px]">
              Enter
            </kbd>{" "}
            or{" "}
            <kbd className="px-1 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-zinc-500 text-[10px]">
              ,
            </kbd>{" "}
            to add •{" "}
            <kbd className="px-1 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-zinc-500 text-[10px]">
              Backspace
            </kbd>{" "}
            to remove last
          </p>
        </div>

        {/* ── Inline "add" hint for manual entry ────────────────────── */}
        {tagInput && (
          <button
            type="button"
            onClick={() => addTag(tagInput)}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add &quot;{tagInput}&quot;
          </button>
        )}

        {/* ── Global Error ──────────────────────────────────────────── */}
        {error && (
          <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* ── Success Banner ────────────────────────────────────────── */}
        {saveSuccess && (
          <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            Business saved successfully! Analysis is starting…
          </div>
        )}
      </div>

      {/* ── Footer / Submit ────────────────────────────────────────────── */}
      <div className="px-6 pb-6">
        <button
          id="start-analysis-btn"
          type="submit"
          disabled={isSaving || saveSuccess}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-white text-zinc-950 hover:bg-zinc-100 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-black/30"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving…
            </>
          ) : saveSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Saved!
            </>
          ) : editingBusiness ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Update Business
            </>
          ) : (
            <>
              Start Analysis
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
