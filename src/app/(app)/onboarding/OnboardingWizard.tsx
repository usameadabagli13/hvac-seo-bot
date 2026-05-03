"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Building2, ChevronRight, Loader2, MapPin, Globe,
  Sparkles, X, CheckCircle2, Plus,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type Step = 0 | 1 | 2 | 3; // profile | business | keywords | done

interface Props {
  userId: string;
  initialName: string;
}

const STEP_LABELS = ["Your profile", "Your business", "SEO keywords"];

// ── Component ─────────────────────────────────────────────────────────────────
export default function OnboardingWizard({ userId, initialName }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 0 — Profile
  const [fullName, setFullName] = useState(initialName);

  // Step 1 — Business
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [serviceLocation, setServiceLocation] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // Step 2 — Keywords
  const [keywords, setKeywords] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const clearError = () => setError(null);

  const addTag = (val: string) => {
    const tag = val.trim();
    if (!tag || keywords.some((k) => k.toLowerCase() === tag.toLowerCase())) return;
    setKeywords((prev) => [...prev, tag]);
    setTagInput("");
  };

  const removeKeyword = (i: number) => setKeywords((prev) => prev.filter((_, idx) => idx !== i));

  // ── Step 0: Save profile name ────────────────────────────────────────────────
  const handleProfileContinue = async () => {
    clearError();
    if (!fullName.trim()) { setError("Please enter your name."); return; }
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase
        .from("profiles")
        .upsert({ user_id: userId, full_name: fullName.trim() }, { onConflict: "user_id" });
      if (err) throw err;
      setStep(1);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save profile.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 1: Create business ──────────────────────────────────────────────────
  const handleBusinessContinue = async () => {
    clearError();
    if (!businessName.trim()) { setError("Business name is required."); return; }
    if (!serviceLocation.trim()) { setError("Service location is required."); return; }
    if (websiteUrl.trim()) {
      try {
        const raw = websiteUrl.trim();
        new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
      } catch {
        setError("Please enter a valid website URL (e.g. https://yoursite.com).");
        return;
      }
    }
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error: err } = await supabase
        .from("businesses")
        .insert({
          user_id: userId,
          business_name: businessName.trim(),
          service_location: serviceLocation.trim(),
          website_url: websiteUrl.trim() || null,
          target_keywords: [],
        })
        .select("id")
        .single();
      if (err) throw err;
      setBusinessId(data.id);
      setStep(2);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create business.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: Generate and save keywords ──────────────────────────────────────
  const handleGenerateKeywords = async () => {
    clearError();
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, location: serviceLocation }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate keywords.");
      const existing = new Set(keywords.map((k) => k.toLowerCase()));
      const fresh = (data.keywords as string[]).filter((k) => !existing.has(k.toLowerCase()));
      setKeywords((prev) => [...prev, ...fresh]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeywordsContinue = async (skip = false) => {
    clearError();
    if (!skip && keywords.length > 0 && businessId) {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { error: err } = await supabase
          .from("businesses")
          .update({ target_keywords: keywords })
          .eq("id", businessId);
        if (err) throw err;
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to save keywords.");
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
    }
    setStep(3);
  };

  // ── Step 3: Mark onboarding complete ────────────────────────────────────────
  const handleFinish = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      await supabase
        .from("profiles")
        .upsert({ user_id: userId, onboarding_complete: true }, { onConflict: "user_id" });
    } catch {
      // Non-critical: proceed anyway
    }
    router.push("/dashboard");
    router.refresh();
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-4rem)] lg:min-h-screen flex flex-col items-center justify-center px-6 py-12">
      {/* Step dot indicator */}
      {step < 3 && (
        <div className="flex items-center gap-2 mb-8">
          {STEP_LABELS.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i < step
                  ? "w-5 h-1.5 bg-white/35"
                  : i === step
                  ? "w-5 h-1.5 bg-white"
                  : "w-1.5 h-1.5 bg-white/15"
              }`}
            />
          ))}
        </div>
      )}

      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">

          {/* ── Step 0: Profile ──────────────────────────────────────────── */}
          {step === 0 && (
            <div className="p-7">
              <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest mb-2">
                Step 1 of 3
              </p>
              <h2 className="text-xl font-semibold text-zinc-100 tracking-tight mb-1">
                What should we call you?
              </h2>
              <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
                This shows up in your profile and in the reports we generate for you.
              </p>

              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleProfileContinue()}
                placeholder="Your full name"
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all duration-200 mb-4"
              />

              {error && <p className="text-xs text-rose-400 mb-4">{error}</p>}

              <button
                onClick={handleProfileContinue}
                disabled={isLoading || !fullName.trim()}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100 active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none"
              >
                {isLoading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><span>Continue</span><ChevronRight className="w-4 h-4" /></>
                }
              </button>
            </div>
          )}

          {/* ── Step 1: Business ─────────────────────────────────────────── */}
          {step === 1 && (
            <div className="p-7">
              <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest mb-2">
                Step 2 of 3
              </p>
              <h2 className="text-xl font-semibold text-zinc-100 tracking-tight mb-1">
                Tell us about your business
              </h2>
              <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
                We&apos;ll use this to generate your first SEO keywords and track local rankings.
              </p>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 uppercase tracking-widest">
                    <Building2 className="w-3 h-3" />
                    Business name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Arctic Air HVAC Services"
                    autoFocus
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all duration-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 uppercase tracking-widest">
                    <MapPin className="w-3 h-3" />
                    Service location <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={serviceLocation}
                    onChange={(e) => setServiceLocation(e.target.value)}
                    placeholder="e.g. Dallas, TX"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all duration-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 uppercase tracking-widest">
                    <Globe className="w-3 h-3" />
                    Website URL
                    <span className="text-zinc-600 font-normal normal-case ml-1">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yoursite.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all duration-200"
                  />
                </div>
              </div>

              {error && <p className="text-xs text-rose-400 mt-4">{error}</p>}

              <button
                onClick={handleBusinessContinue}
                disabled={isLoading || !businessName.trim() || !serviceLocation.trim()}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100 active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none mt-6"
              >
                {isLoading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><span>Continue</span><ChevronRight className="w-4 h-4" /></>
                }
              </button>
            </div>
          )}

          {/* ── Step 2: Keywords ─────────────────────────────────────────── */}
          {step === 2 && (
            <div className="p-7">
              <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest mb-2">
                Step 3 of 3
              </p>
              <h2 className="text-xl font-semibold text-zinc-100 tracking-tight mb-1">
                Seed your SEO keywords
              </h2>
              <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
                AI will suggest high-intent HVAC keywords for {serviceLocation}. You can always edit these later.
              </p>

              <button
                onClick={handleGenerateKeywords}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800/80 text-zinc-100 border border-white/[0.10] text-sm font-medium hover:bg-zinc-700/80 hover:border-white/[0.15] active:scale-[0.97] transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none mb-5"
              >
                {isGenerating
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                  : <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
                }
                {isGenerating ? "Generating…" : "Generate with AI"}
              </button>

              {/* Keyword pills */}
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/[0.09] text-xs text-zinc-300 font-medium"
                    >
                      {kw}
                      <button
                        type="button"
                        onClick={() => removeKeyword(i)}
                        className="text-zinc-500 hover:text-rose-400 transition-colors"
                        aria-label={`Remove ${kw}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Manual tag input */}
              <div className="flex gap-2">
                <input
                  ref={tagInputRef}
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addTag(tagInput);
                    }
                  }}
                  onBlur={() => addTag(tagInput)}
                  placeholder="Or type a keyword and press Enter"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all duration-200"
                />
                {tagInput.trim() && (
                  <button
                    type="button"
                    onClick={() => addTag(tagInput)}
                    className="px-3 rounded-xl border border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:border-white/20 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>

              {error && <p className="text-xs text-rose-400 mt-3">{error}</p>}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleKeywordsContinue(true)}
                  disabled={isLoading}
                  className="flex-1 h-11 rounded-xl border border-white/[0.08] text-zinc-400 text-sm hover:text-zinc-200 hover:border-white/[0.15] transition-all duration-150 disabled:opacity-40"
                >
                  Skip for now
                </button>
                <button
                  onClick={() => handleKeywordsContinue(false)}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100 active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none"
                >
                  {isLoading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><span>Finish</span><ChevronRight className="w-4 h-4" /></>
                  }
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Done ─────────────────────────────────────────────── */}
          {step === 3 && (
            <div className="p-7 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-5">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-zinc-100 tracking-tight mb-2">
                You&apos;re all set!
              </h2>
              <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
                {businessName} is ready. Head to your dashboard to connect Google Business Profile and start tracking your rankings.
              </p>
              <button
                onClick={handleFinish}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100 active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none"
              >
                {isLoading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><span>Go to Dashboard</span><ChevronRight className="w-4 h-4" /></>
                }
              </button>
            </div>
          )}
        </div>

        {/* Global skip link — hidden on done screen */}
        {step < 3 && (
          <p className="text-center text-xs text-zinc-700 mt-5">
            <button
              onClick={handleFinish}
              disabled={isLoading}
              className="hover:text-zinc-500 transition-colors disabled:pointer-events-none"
            >
              Skip setup entirely →
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
