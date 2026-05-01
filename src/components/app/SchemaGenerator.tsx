"use client";

import { useState, useMemo } from "react";
import { Copy, Check, ChevronDown } from "lucide-react";

interface Business {
  id: string;
  business_name: string;
  service_location: string;
  website_url: string | null;
  target_keywords: string[] | null;
}

interface Props {
  businesses: Business[];
}

function buildSchema(
  biz: Business,
  phone: string,
  streetAddress: string,
  openHour: string,
  closeHour: string
): string {
  const parts = biz.service_location.split(",").map((s) => s.trim());
  const locality = parts[0] ?? biz.service_location;
  const region = parts[1] ?? "";

  const keywords = Array.isArray(biz.target_keywords) ? biz.target_keywords : [];
  const description =
    keywords.length > 0
      ? `Professional HVAC services in ${biz.service_location}. Specializing in ${keywords.slice(0, 3).join(", ")}.`
      : `Professional HVAC services in ${biz.service_location}. AC repair, heating installation, and HVAC maintenance.`;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "HVACBusiness"],
    name: biz.business_name,
    description,
    ...(biz.website_url ? { url: biz.website_url } : {}),
    ...(phone.trim() ? { telephone: phone.trim() } : {}),
    address: {
      "@type": "PostalAddress",
      ...(streetAddress.trim() ? { streetAddress: streetAddress.trim() } : {}),
      addressLocality: locality,
      ...(region ? { addressRegion: region } : {}),
      addressCountry: "US",
    },
    areaServed: {
      "@type": "City",
      name: biz.service_location,
    },
    priceRange: "$$",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: openHour,
        closes: closeHour,
      },
    ],
  };

  return JSON.stringify(schema, null, 2);
}

const EMBED_TABS = ["HTML / Raw", "WordPress"] as const;
type EmbedTab = (typeof EMBED_TABS)[number];

export default function SchemaGenerator({ businesses }: Props) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [phone, setPhone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [openHour, setOpenHour] = useState("08:00");
  const [closeHour, setCloseHour] = useState("18:00");
  const [copied, setCopied] = useState(false);
  const [embedTab, setEmbedTab] = useState<EmbedTab>("HTML / Raw");

  const biz = businesses[selectedIdx];

  const schemaJson = useMemo(
    () => (biz ? buildSchema(biz, phone, streetAddress, openHour, closeHour) : ""),
    [biz, phone, streetAddress, openHour, closeHour]
  );

  const scriptTag = `<script type="application/ld+json">\n${schemaJson}\n</script>`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(scriptTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (businesses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/[0.07] bg-white/[0.01] px-6 py-16 text-center max-w-md mx-auto">
        <p className="text-sm font-medium text-zinc-400 mb-1">No businesses yet</p>
        <p className="text-xs text-zinc-600 leading-relaxed">
          Add a business on the{" "}
          <a href="/dashboard" className="text-zinc-400 underline underline-offset-2 hover:text-zinc-200">
            Dashboard
          </a>{" "}
          first, then come back to generate your schema markup.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Business selector ──────────────────────────────────────────── */}
      {businesses.length > 1 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Business
          </label>
          <div className="relative max-w-xs">
            <select
              value={selectedIdx}
              onChange={(e) => setSelectedIdx(Number(e.target.value))}
              className="w-full appearance-none px-4 py-2.5 pr-9 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-zinc-200 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all duration-200"
            >
              {businesses.map((b, i) => (
                <option key={b.id} value={i} className="bg-zinc-900 text-zinc-200">
                  {b.business_name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          </div>
        </div>
      )}

      {/* ── Two-column layout ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: optional extra fields */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-200 mb-0.5">
                Enhance your schema
              </h3>
              <p className="text-xs text-zinc-600">
                Optional fields that improve Google&apos;s understanding of your listing.
              </p>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1-555-123-4567"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all duration-200"
              />
            </div>

            {/* Street address */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Street Address
              </label>
              <input
                type="text"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="123 Main St"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all duration-200"
              />
            </div>

            {/* Hours */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Business Hours (Mon–Fri)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={openHour}
                  onChange={(e) => setOpenHour(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-zinc-200 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all duration-200"
                />
                <span className="text-xs text-zinc-600">to</span>
                <input
                  type="time"
                  value={closeHour}
                  onChange={(e) => setCloseHour(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-zinc-200 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all duration-200"
                />
              </div>
            </div>

            {/* What's pre-filled */}
            <div className="pt-1 border-t border-white/[0.05]">
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                Auto-filled from your profile:{" "}
                <span className="text-zinc-500">
                  business name, location, website
                  {Array.isArray(biz?.target_keywords) && biz.target_keywords.length > 0
                    ? ", keywords"
                    : ""}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Right: generated code */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Generated Schema
            </p>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 ${
                copied
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy &lt;script&gt; tag
                </>
              )}
            </button>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
              </div>
              <span className="text-[11px] text-zinc-600 font-mono">
                application/ld+json
              </span>
            </div>
            <pre className="px-5 py-4 text-[12px] leading-relaxed text-zinc-300 font-mono overflow-x-auto whitespace-pre">
              {schemaJson}
            </pre>
          </div>
        </div>
      </div>

      {/* ── Embed instructions ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
        <div className="flex border-b border-white/[0.06]">
          {EMBED_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setEmbedTab(tab)}
              className={`px-5 py-3 text-xs font-medium transition-colors duration-150 ${
                embedTab === tab
                  ? "text-zinc-100 border-b-2 border-zinc-300 -mb-px"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="px-5 py-5 text-sm text-zinc-400 leading-relaxed space-y-3">
          {embedTab === "HTML / Raw" ? (
            <>
              <p>
                Paste the copied <code className="px-1.5 py-0.5 rounded bg-white/[0.05] text-zinc-300 text-xs font-mono">&lt;script&gt;</code> tag
                inside the <code className="px-1.5 py-0.5 rounded bg-white/[0.05] text-zinc-300 text-xs font-mono">&lt;head&gt;</code> section
                of your website&apos;s HTML — ideally on every page, but at minimum on your homepage.
              </p>
              <div className="rounded-xl bg-zinc-900/60 border border-white/[0.06] px-4 py-3 font-mono text-xs text-zinc-400 leading-relaxed">
                <span className="text-zinc-600">&lt;!-- In your &lt;head&gt; --&gt;</span>
                {"\n"}<span className="text-zinc-400">&lt;script type=&quot;application/ld+json&quot;&gt;</span>
                {"\n"}{"  "}<span className="text-zinc-500">{"{ ... your schema ... }"}</span>
                {"\n"}<span className="text-zinc-400">&lt;/script&gt;</span>
              </div>
              <p className="text-xs text-zinc-600">
                After adding the script, validate it at{" "}
                <span className="text-zinc-500 underline underline-offset-2">
                  schema.org/validator
                </span>{" "}
                or Google&apos;s Rich Results Test.
              </p>
            </>
          ) : (
            <>
              <p>
                Install the free{" "}
                <strong className="text-zinc-300">Yoast SEO</strong> or{" "}
                <strong className="text-zinc-300">RankMath</strong> plugin. Both have a
                &ldquo;Schema&rdquo; or &ldquo;Structured Data&rdquo; tab where you can paste custom JSON-LD.
              </p>
              <p>
                Alternatively, install{" "}
                <strong className="text-zinc-300">Insert Headers and Footers</strong> (free plugin),
                paste the full <code className="px-1.5 py-0.5 rounded bg-white/[0.05] text-zinc-300 text-xs font-mono">&lt;script&gt;</code> tag
                in the &ldquo;Header&rdquo; section, and save. No coding required.
              </p>
              <p className="text-xs text-zinc-600">
                Google caches schema for up to 24 hours after deployment —
                allow a full day before testing with the Rich Results Test.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
