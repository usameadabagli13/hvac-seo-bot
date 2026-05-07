# PROJECT_MASTER.md — HVAC SEO Bot
> **Living document. Update checkboxes as features ship. Last reviewed: 2026-05-07.**

---

## 🏗 Stack Snapshot

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) | React 19, Server Components by default |
| Auth + DB | Supabase (PostgreSQL + RLS) | `@supabase/ssr` v0.10 |
| AI | Gemini 2.5 Flash | JSON mode enforced |
| Styling | Tailwind CSS v4 | Monochromatic zinc palette — **NO purple/indigo** |
| Payments | Dodo Payments | Merchant of Record — no LLC needed; webhook at `/api/dodo/webhook` |
| Hosting | Vercel (recommended) | Edge middleware for auth |

---

## ⚠️ Architect's Critical Critique & Trap Warnings

Read these before writing a single line of new code.

### 1. Missing Rate-Limit Guard on the AI Route
`/api/generate-keywords` is currently open — any authenticated user can hammer Gemini.
**Fix:** Add an `ai_usage` table + server-side check before every Gemini call. This is the foundation for the freemium paywall (Phase 6).

### 2. `indigo` Colors Leak in Current Dashboard
`dashboard/page.tsx` lines 34–35, 65, 81, 167, 176 use `indigo-*` classes. The UI spec says **NO indigo**. Replace all with `zinc-*` or `white/[opacity]` tokens before shipping.

### 3. No `website_url` Validation
The form accepts any string as `website_url`. A bad URL will silently break the Phase 5 crawler. Add `new URL()` validation server-side in the API route.

### 4. RLS Policy Gap — Service-Role Key Exposure Risk
Never expose `SUPABASE_SERVICE_ROLE_KEY` to Client Components. All admin writes (Phase 8) must go through Server Actions or API routes only.

### 5. Dodo Webhook Idempotency Trap
Dodo Payments can fire the same webhook event twice. Every webhook handler **must** use `event_id` (from `webhook-id` header) as a unique key in `dodo_events` table — implemented and live.

### 6. GBP OAuth ≠ Places API
Google Business Profile API requires OAuth 2.0 with `https://www.googleapis.com/auth/business.manage` — it is **NOT** the same credential as Google Maps/Places. Plan a separate OAuth flow stored in an `integrations` table.

### 7. CRON Jobs on Vercel Free Plan
Vercel Cron requires the Pro plan. Use Supabase `pg_cron` extension + Edge Functions as a free alternative.

### 8. Missing Error Boundary Strategy
No `error.tsx` files exist yet. Every route segment needs one, or a single unhandled exception kills the entire dashboard view.

### 9. LinkedIn Outreach ToS Trap
LinkedIn's API does not allow automated messaging to non-connections. Any scraping approach violates ToS and risks account bans. See Phase 7 for the recommended pivot.

---

## 📐 Database Schema Master Plan

```sql
-- EXISTING
businesses (id, user_id, business_name, service_location, website_url, target_keywords jsonb, is_service_area_business bool default false, created_at)

-- PHASE 2
profiles (id, user_id, full_name, avatar_url, onboarding_complete bool, created_at)

-- PHASE 3
reviews (id, business_id, platform, review_id, author, rating, body, sentiment, ai_reply, replied_at, fetched_at)

-- PHASE 4
rank_snapshots (id, business_id, keyword, lat, lng, rank_position, grid_size, snapshot_date)
competitors (id, business_id, name, place_id, avg_rating, review_count, tracked_keywords jsonb)

-- PHASE 5
seo_audits (id, business_id, crawled_url, page_title, h1, meta_description, issues jsonb, score int, audited_at)

-- PHASE 6
profiles.plan (column added: 'starter' | 'pro' | 'agency', default 'starter')
profiles.trial_ends_at (column added: timestamptz nullable; future=active trial, past=expired, NULL=subscribed)
ai_usage (id, user_id, feature text, count int, period_start date, UNIQUE(user_id, feature, period_start))
dodo_events (id uuid, event_id text UNIQUE, event_type text, processed_at timestamptz)  -- idempotency

-- PHASE 7
report_jobs (id, user_id, business_id, report_type text, status text, file_url text, scheduled_at timestamptz, sent_at timestamptz)

-- PHASE 8
admin_audit_log (id, admin_user_id, action text, target_table text, target_id uuid, payload jsonb, created_at)

-- PHASE 9 (Architect Additions)
citations (id, business_id, directory text, listing_url text, nap_consistent bool, last_checked_at timestamptz)
schema_markup (id, business_id, markup_type text, json_ld jsonb, generated_at timestamptz)
outreach_prospects (id, user_id, business_name, city, email, template_used, status text, created_at)
```

---

## Phase 1: Public Face & Acquisition

**Goal:** Drive signups before the product is fully built. Every day without a landing page is lost MRR.

### 1.1 Landing Page (`/`)
- [x] Hero section — headline, sub-headline, single CTA ("Start Free Trial")
- [x] Live keyword demo widget (show AI keywords without signing up — calls rate-limited `/api/demo-keywords`)
- [x] Features grid — 6 features, icon + copy, zinc card style
- [x] Pricing section — Starter / Pro / Agency tiers with annual toggle
- [x] Social proof — 3 testimonials with green metric badges (+34% calls, 5★, Top 3 ranks)
- [x] FAQ accordion (5 questions covering trust objections)
- [x] Footer — 4-column (Brand / Product / Resources / Company) + newsletter widget
- [x] Dashboard screenshot section (real product image after hero)
- [x] "How it works" 3-step section (Add business → Run AI → Watch rank)
- [x] HVAC industry stats section (97% / 46% / 76% / $10B)
- [x] Trust bar (SOC 2 / GDPR / 256-bit / 99.9% uptime badges)
- [x] Founding member promo bar with claimed counter
- [x] Social-proof avatar strip above demo widget
- [x] Mobile hamburger nav drawer (`MobileNav` — 15 links)
- [x] Sticky mobile CTA (`StickyMobileCTA` — appears 600px+ scroll, dismissible)

### 1.2 Auth Flow
- [x] `/login` — Google OAuth button + email magic link (signInWithOtp)
- [x] `/auth/callback` — Redirect to `/onboarding` for new users, `/dashboard` for returning
- [x] `/auth/error` — Friendly error page for failed OAuth states
- [x] Email magic link login alongside Google OAuth (Supabase signInWithOtp)
- [ ] `/forgot-password` — N/A (magic link covers reset use case)

### 1.3 Waitlist / Lead Capture
- [x] `waitlist` table: `(id, email, name, company, source, created_at)`
- [x] Embedded form on landing page (no auth required)
- [x] POST `/api/waitlist` → insert + welcome email via Resend
- [x] Admin view in Phase 8 — `/admin/waitlist` with CSV export

---

## Phase 2: Core Dashboard & Onboarding 🚧 PARTIAL

**Goal:** First-run experience that reaches "aha moment" in under 3 minutes.

### 2.1 Onboarding Flow (`/onboarding`)
- [x] Multi-step wizard: Profile → Add Business → Generate Keywords → Done
- [x] `profiles.onboarding_complete` bool — set true on finish; page redirects to `/dashboard` if already complete
- [x] Skip option (both per-step and full wizard skip at bottom)
- [x] Step indicator (pills, not percentage bar)
- [ ] Middleware redirect for returning users who never completed onboarding (deferred)

### 2.2 Dashboard Home (`/dashboard`)
- [x] Fix `indigo-*` color leaks (see Critique #2 above)
- [x] Migrated into `(app)` route group — Sidebar layout now wraps dashboard
- [x] Global stats: Reviews count, Businesses count, Keywords count
- [x] Recent activity feed (last 3 reviews with author, rating, business name)
- [x] Quick-action buttons: Reviews / Rank Tracker / Schema Markup
- [x] Empty state with onboarding CTA for new users
- [x] **Activation Checklist card** — "Add Business → Connect GBP → Run First Scan" adım sırası; tamamlananlar ✓ ile kapanır, hepsi bitince gizlenir

### 2.3 Business Detail Page (`/dashboard/businesses/[id]`)
- [x] Tabbed layout: Overview / Keywords / Reviews / SEO Audit / Competitors
- [x] Edit business form (inline edit on detail page)
- [x] Soft delete with `deleted_at` column — all SELECT queries filter, PATCH endpoint accepts deleted_at, EditableBusinessHeader has Delete button
- [x] **SAB checkbox** — "Service Area Business (no physical storefront)" toggle on BusinessForm; adds `is_service_area_business` column to `businesses` table. HVAC firmaları için kritik — çoğunun showroom'u yoktur

### 2.4 Settings (`/settings`)
- [x] Profile tab: display name (saved to auth metadata), email (read-only)
- [x] API Usage tab: visual usage bars per feature with monthly reset date
- [x] Billing tab: current plan badge + Dodo Payments checkout buttons (live)
- [x] Danger zone: Delete account with "type DELETE" confirmation + cascade
- [x] Avatar upload to Supabase Storage — `avatars` bucket + RLS policies + Settings UI
- [x] Dodo Customer Portal self-serve link — `/api/dodo/portal` + Settings → Billing "Manage" button (visible once webhook captures customer_id)

### 2.5 Navigation Shell
- [x] Sidebar (desktop) + bottom nav (mobile)
- [x] Active route highlight
- [x] Plan badge in sidebar (Free / Pro / Agency)
- [x] Keyboard shortcuts: `G+D` = Dashboard, `G+R` = Reviews, `G+K` = Rank Tracker, `G+S` = Settings
- [x] **Sidebar usage widget** — plan badge'in altına "Replies: 2/3 · Snapshots: 0/1" progress bar'ları; sadece starter plan'da gösterilir

---

## Phase 3: Review & Reputation Engine 🚧 IN PROGRESS

**Goal:** The feature HVAC owners will pay for on day one — responding to Google reviews is their #1 pain point.

### 3.0 Review Feed UI Shell
- [x] `/reviews` page with mock data (10 realistic HVAC reviews)
- [x] Stats strip: Total Reviews, Avg Rating, Unreplied, This Month
- [x] Filter bar: sentiment tabs (All / Positive / Neutral / Negative) + Unreplied toggle
- [x] Review cards: author avatar, star rating, sentiment badge, platform, body with expand
- [x] "Generate AI Reply" placeholder button (disabled until Phase 3.1 GBP connected)
- [x] Reviews added to Sidebar nav (`G R` shortcut)
- [x] "SAMPLE DATA" banner — GBP bağlı değilken mock review'lar gösterilir, amber banner ile işaretlenir
- [x] "This uses 1 credit" hint + tooltip on Generate Reply / Run Snapshot / Generate Keywords

### 3.1 GBP OAuth Integration
- [x] `integrations` table with RLS (migration `20260501000001_add_integrations.sql`)
- [x] `/api/auth/gbp` — initiates OAuth with `business.manage` scope + CSRF state cookie
- [x] `/api/auth/gbp/callback` — exchanges code, resolves first account/location, upserts tokens
- [x] `/api/auth/gbp/disconnect` — deletes integration row (POST)
- [x] `src/lib/gbp.ts` — `getValidToken` (auto-refresh), `getGBPReviews`, `getGBPStatus`
- [x] On-demand token refresh (5-min lookahead) — replaces cron for Phase 3.1
- [x] `GBPConnectBanner` component — connect / connected+disconnect / api-error states
- [x] Reviews page wired: live GBP data when connected, graceful fallback to mock on error
- [x] Multi-location selector — `GBPLocationSwitcher` dropdown in connect banner; updates `integrations.location_name` via `/api/google/select-location`
- [ ] Supabase Vault encryption for stored tokens (security hardening)

### 3.2 Review Fetcher
- [x] `/api/reviews/fetch` — calls GBP API, upserts into `reviews` table
- [x] Deduplication via `UNIQUE(business_id, platform, review_id)`
- [x] Reviews page reads from DB first; "Sync Reviews" button triggers manual re-fetch
- [x] Daily background sync via Vercel Cron at `/api/cron/sync-reviews` (Hobby-plan: daily 6am UTC)

### 3.3 Sentiment Analysis Dashboard
- [x] Gemini classifies each review: `positive | neutral | negative` (batch, single API call per sync)
- [x] Result stored in `reviews.sentiment` — written during sync, not post-insert
- [x] Rating distribution chart (1★–5★ bar chart with colour-coded bars)
- [x] Filter by: rating, sentiment, date, replied/unreplied (done in 3.0 shell)
- [x] 1-sentence AI summary per review — `sentiment_summary` column + `analyzeReviews()` returns sentiment+summary in same Gemini call

### 3.4 AI Reply Generator
- [x] "Generate Reply" button per review → POST `/api/reviews/generate-reply`
- [x] Gemini prompt: "Expert Technician + Customer First" tone, adapts to star rating
- [x] Tone shifts: positive (gratitude) / neutral (acknowledge + improve) / negative (apology + action)
- [x] Editable textarea draft — user can tweak before posting
- [x] Copy-to-clipboard button with feedback state
- [x] Character count shown in footer
- [x] **Freemium gate:** Free = 5 AI replies/month (tracked in `ai_usage` table)
- [x] "Post to Google" — wired to GBP API (`/api/reviews/post-reply`, `lib/gbp.ts#postGBPReviewReply`)
- [x] Save Reply button — saves `ai_reply` + sets `is_replied = true` in DB, triggers router.refresh()
- [x] 3 reply variants (formal / friendly / apologetic) — single Gemini call returns JSON with three drafts; ReviewFeed has tone tabs

---

## Phase 4: Local Rank & Competitor Spy 🚧 IN PROGRESS

**Goal:** The visual "wow" feature that justifies a Pro subscription renewal every month.

### 4.1 Grid-Based Local Rank Heatmap
- [x] Business dropdown selector — `BusinessSwitcher` URL-based, shared across rank/schema/citations
- [x] **HVAC keyword chip suggestions** — rank keyword input'una tıklanabilir chip'ler: ["AC repair", "furnace install", "emergency HVAC", "ductwork", "heat pump"]
- [x] **Test Mode / "Try free, no credits used" badge** — mock data görünürken `is_mock` flag'e göre rozet göster
- [x] Keyword dropdown / chip suggestions — chips above input act as one-tap defaults
- [ ] User sets a "primary" target keyword per business (deferred — multi-keyword approach + chip UX preferred)
- [x] Generate 5×5 grid of lat/lng points around business (1-mile spacing)
- [x] Call Google Places Text Search API for each grid point (25 calls per snapshot) — `/api/rank/run-snapshot`
- [x] DB migration: `rank_snapshots` table with RLS (`20260501000002_phase4_rank_competitors.sql`)
- [x] `google_place_id` column added to `businesses` (migration `20260506000001`) — cached after first lookup
- [x] Mock data + dev seed route (`/api/rank/seed-mock`, `src/lib/mock-rank-snapshots.ts`)
- [x] Render heatmap on Mapbox GL (circle + heatmap + symbol layers, dark-v11 style)
- [x] Click-to-popup: rank, tier, trend delta
- [x] Historical trend arrows (prev snapshot comparison)
- [x] "Run Snapshot" button → live Google Places API calls (`/api/rank/run-snapshot`)
- **⚠️ Cost trap:** 25 API calls × price per call × users × keywords. Cache aggressively. Free = monthly snapshots only.

### 4.3 Deferred / Rejected Features
- ❌ **Compare sayfası** — historical rank snapshot data yokken anlamsız; Phase 4 live ile birlikte değerlendirilecek, ayrı aksiyon değil

### 4.2 Competitor Tracker
- [x] User adds competitors via free-text query — Find Place biased to service location; Pro=3, Agency=10
- [x] Fetch: avg rating, review count via Place Details
- [x] Side-by-side list in Competitors tab with remove button
- [ ] "Keyword gap" analysis (deferred — needs more competitor data structure first)

---

## Phase 5: On-Page SEO Crawler

**Goal:** Concrete, actionable to-do list that delivers immediate felt value.

### 5.1 Website Crawler (`src/lib/crawler.ts`)
- [x] Server-side `fetch()` of `website_url`
- [x] Validate URL with `new URL()` before crawling (Critique #3)
- [x] Parse: title, H1, H2 count, meta description, body text, image alt coverage, JSON-LD presence, word count
- [x] Handle redirects (follow), 8s timeout, non-HTML responses (415)
- [x] Check `robots.txt` before crawling (best-effort, refuses on explicit deny)
- [x] Store in `seo_audits` table (migration 20260506000007)

### 5.2 SEO Gap Analyzer (Gemini)
- [x] Send page data + `target_keywords` to Gemini
- [x] Returns `{ score, issues: [{severity, element, current, recommended}] }` as JSON
- [x] Concrete recommendations e.g. "Title is 38 chars, expand with city + service keyword"
- [x] Score 0–100 — Gemini self-scores with severity guidance baked in
- [x] Render as prioritized checklist: Critical / Warning / Info badges in business detail SEO Audit tab
- **Freemium:** Free = 1 audit/month, Pro = unlimited + weekly auto-recrawl

---

## Phase 6: Monetization & Paywalls

**Goal:** Every feature in Phases 1–5 needs a paywall retrofit. Schema is already planned above — implement it now.

### 6.1 Payment Integration — ✅ Dodo Payments (LIVE)
- [x] `npm install dodopayments standardwebhooks`
- [x] `src/lib/dodo.ts` — lazy singleton client + `PLAN_PRODUCTS` + `PRODUCT_TO_PLAN`
- [x] `/api/dodo/checkout` — creates checkout session, returns redirect URL
- [x] `/api/dodo/webhook` — Standard Webhooks signature verification, idempotency via `dodo_events` table, updates `profiles.plan`
- [x] Products created in Dodo dashboard: Starter/Pro/Agency × monthly/yearly (6 products)
- [x] Webhook URL registered: `https://www.heatrankai.com/api/dodo/webhook`

### 6.2 14-Day Free Trial
- [x] `trial_ends_at timestamptz` column added to `profiles` (migration `20260505000005`)
- [x] Signup trigger sets `plan = 'pro'` + `trial_ends_at = now() + 14 days`
- [x] `src/lib/trial.ts` — `resolveTrialState()` auto-downgrades to 'starter' when expired
- [x] **Trial countdown banner** — sticky top bar; X days left + Upgrade CTA; red urgency when expired
- [x] Webhook clears `trial_ends_at = NULL` on paid subscription (no more countdown after payment)
- [x] Day 12 email via Resend — daily Vercel cron `/api/cron/trial-emails`, idempotent via `profiles.trial_email_sent_at`
- [ ] Frozen state: full-screen upgrade CTA overlay (deferred — TrialBanner + UpgradeGate per Pro feature is gentler UX, full-screen lockout reserved for actual abuse)

### 6.3 Usage Tracking Utilities (`src/lib/usage.ts`)
- [x] `incrementUsage(userId, feature)` — atomic `UPDATE count + 1` via `increment_ai_usage` RPC
- [x] `checkUsageAllowed(userId, feature)` — compare count vs. Starter plan limit
- [x] Wire into every AI route before calling Gemini
- [x] Limits match Phase 6.4 table: keyword_generation=1/mo, review_reply=3/mo

### 6.4 Pricing & Plan Limits

**Decoy pricing goal: push 70%+ of users to Pro ($69).** Starter is intentionally limited.

| Feature | Starter $39/mo | Pro $69/mo ⭐ | Agency $199/mo |
|---|---|---|---|
| Businesses | 1 | 5 | Unlimited |
| AI Keyword Generations | 1/mo | Unlimited | Unlimited |
| AI Review Replies | 3/mo | Unlimited | Unlimited |
| SEO Audits | — | Unlimited | Unlimited |
| Rank Snapshots | — | Weekly | Daily |
| Competitor Tracking | — | 3 | 10 |
| Schema Markup | ✓ basic | ✓ full | ✓ full |
| PDF Reports | — | Weekly | Daily |
| White-Label | — | — | ✓ |
| Priority Support | — | ✓ | ✓ |

Annual pricing (~20% discount): Starter $32/mo, Pro $55/mo, Agency $159/mo.

### 6.5 Paywall UI Components
- [x] `<UpgradeGate feature="..." />` — blurred overlay + CTA (`src/components/paywall/UpgradeGate.tsx`)
- [x] `<UsageBar feature="..." />` — Settings + sidebar widget
- [x] `<PlanBadge />` — sidebar plan indicator (existing)
- [x] `/pricing` page with annual toggle (2 months free) — shared PLANS lib + reused components
- [x] Payment portal link for self-serve cancellation — Dodo customer portal session

---

## Phase 7: Retention & Automation

**Goal:** Make users feel the product is working for them even when not logged in.

### 7.1 Weekly PDF Reports
- [ ] `npm install @react-pdf/renderer`
- [ ] Report content: ranking changes, new reviews summary, SEO score delta, keyword performance
- [ ] Store PDF in Supabase Storage, URL in `report_jobs` table
- [ ] Email via Resend with PDF attached
- [ ] Schedule: Supabase `pg_cron` every Monday 8am in user's timezone

### 7.2 Image EXIF Optimizer
- [ ] `npm install sharp`
- [ ] User uploads HVAC job photos
- [ ] Server strips old EXIF, injects: `ImageDescription` = business name + location + keyword, `GPSLatitude/Longitude` = business address
- [ ] Return optimized image download
- [ ] Educate: "Google indexes EXIF data for local image search"

### 7.3 Prospect Cold Email Builder (LinkedIn Pivot)
- [ ] **Reason for pivot:** LinkedIn API bans automated outreach to non-connections. Scraping risks account termination.
- [ ] User inputs city + service type → Gemini generates 20 local businesses likely needing HVAC SEO
- [ ] Personalized cold email template per prospect (Gemini-written)
- [ ] `outreach_prospects` table: name, city, email, template, status (contacted/replied/converted)

---

## Phase 8: SuperAdmin Dashboard

**Goal:** Founder visibility into business metrics without touching the database directly.

### 8.1 Access Control
- [x] `/admin` protected by `requireAdmin()` server guard checking `profiles.role = 'admin'`
- [x] Role set manually via Supabase: `UPDATE profiles SET role='admin' WHERE user_id='...'`
- [x] Server-side role verification (server component layout, no client check)

### 8.2 Admin Dashboard (`/admin`)
- [x] 8 KPI cards: total users, paid, active trials, businesses, reviews, snapshots-30d, audits-30d, waitlist
- [x] Recent signups (last 10 in 30 days)
- [x] AI usage breakdown for the current month
- [x] Waitlist manager — `/admin/waitlist` with CSV export
- [x] User lookup — `/admin/users` with email/name/user_id search
- [ ] MRR tracker (deferred — Dodo Payments doesn't expose subscription totals via API)
- [ ] Churn rate / signup chart (deferred — KPI cards cover the same need at this stage)

### 8.3 System Health Panel
- [x] Env-var presence checks (10 critical vars)
- [x] Recent Dodo webhook deliveries (last 20) + 30-day count
- [ ] Supabase DB size + row counts (deferred — Supabase dashboard already shows this)

---

## Phase 9: Architect's Strategic Additions

> Features the original plan missed — these are the real competitive moats.

### 9.1 NAP Citation Manager ⭐ HIGH PRIORITY
**Why:** NAP (Name, Address, Phone) consistency across 80+ directories (Yelp, Angi, HomeAdvisor, BBB, YellowPages) is a top-3 local ranking factor. No competitor does this cleanly.
- [x] `citations` table: directory, listing_url, detected NAP, consistency flag
- [x] User pastes directory listing URL → Gemini extracts the NAP from the page
- [x] Consistency checker: compare vs. canonical NAP stored on `businesses` (phone + street_address columns added)
- [x] Score: "X/N consistent" badge on the citations page
- [x] For each inconsistent listing: side-by-side field diff cards (Yours vs Listed)
- [ ] Pro: auto-submit to free directories (deferred — needs partnerships with each directory's submission API)

### 9.2 JSON-LD Schema Markup Generator ⭐ QUICK WIN
**Why:** HVAC businesses universally have zero structured data. 30-minute build, massive perceived value.
- [x] Generate `LocalBusiness` + `HVACBusiness` JSON-LD from business profile data
- [x] Include: name, address, phone, location, openingHours, priceRange, areaServed
- [x] One-click copy to clipboard (copies full `<script>` tag)
- [x] CMS-tailored embed instructions (WordPress snippet vs. raw HTML `<head>` tag)
- [x] Business selector dropdown — `BusinessSwitcher` URL-based shared component
- [x] "Test with Google Rich Results" external link — opens search.google.com/test/rich-results pre-filled
- [x] Weekend hours support (Sat/Sun checkbox + time inputs, emits OpeningHoursSpecification)
- [x] Site-wide JSON-LD `@graph`: Organization, WebSite, SoftwareApplication, AggregateOffer, FAQPage in `layout.tsx`
- [x] Per-page schema: WebPage + Service + BreadcrumbList on city pages, Article on blog posts
- [ ] Store in `schema_markup` table with version history (deferred — current generator is stateless and works fine without versioning)

### 9.3 Google Business Profile Post Scheduler
**Why:** Regular GBP posts improve local pack visibility. HVAC owners never do this — it's tedious.
- [ ] Gemini generates 4 seasonal posts/month (AC tune-up spring, heating check fall, filter change reminder)
- [ ] User approves/edits in a calendar-style queue UI
- [ ] Scheduled via `pg_cron` + GBP API at optimal times (Tue/Thu 9am local)
- [ ] Track impressions + clicks from GBP Insights API

### 9.4 Keyword Cannibalization Detector
**Why:** HVAC sites often have 10 pages all targeting "AC repair" — they compete against each other and hurt rankings.
- [ ] Crawl all pages of `website_url` (via sitemap.xml or link following, max 50 pages)
- [ ] Map each page to its primary keyword (Gemini classification)
- [ ] Detect duplicate primary keywords across pages
- [ ] Report: "Pages /ac-repair and /air-conditioning-fix both target 'AC repair Dallas' — merge them"

### 9.5 White-Label Mode (Agency Tier Revenue Multiplier)
**Why:** One marketing agency managing 20 HVAC clients = 20× MRR from a single customer. This is the highest-leverage feature for revenue.
> ⚠️ **Strateji notu:** Agency-first pivot reddedildi. Agency tier landing page'de görünsün (decoy etkisi), ama outbound efor owner'a gitsin. İlk 20 ödeyen owner'dan sonra agency channel test edilebilir.
- [ ] `white_label_settings`: agency logo URL, brand color (hex), custom domain, from-email name
- [ ] PDF reports render with agency branding, zero mention of HVAC SEO Bot
- [ ] Custom subdomain support via Vercel Domains API: `seo.agencyname.com`
- [ ] Agency manages sub-accounts (each HVAC client is a sub-user under the agency)
- [ ] Agency billing: flat seat price, not per-business

### 9.6 AI Voice Review Responder (Future Differentiator)
**Why:** Many HVAC owners are tradespeople, not typists. Voice-first removes the #1 friction for review responses.
- [ ] "Respond by Voice" button → browser records audio (Web Speech API)
- [ ] Transcribe via Gemini audio input
- [ ] Gemini polishes transcription into a professional reply
- [ ] User reads, confirms, posts to GBP — zero typing required

---

## Phase 10: Marketing & SEO Content Expansion ✅ SHIPPED 2026-05-07

**Goal:** Build out the public site for organic SEO traffic, conversion optimization, and lead capture.

### 10.1 Geographic landing pages
- [x] `/hvac-seo/[city]` — 25 dedicated city pages (Dallas, Houston, Phoenix, etc.) with `generateStaticParams`, climate notes, market analysis, rank heatmap mockup, nearby areas
- [x] `/hvac-seo/state/[state]` — 18 dynamic state aggregation pages (TX, FL, CA, AZ, GA, CO, IL, etc.) listing all our cities in that state
- [x] BreadcrumbList JSON-LD on city pages
- [x] Sitemap auto-generates city + state routes from `CITIES` data

### 10.2 Competitor comparison pages
- [x] `/vs-seo-agency` — HeatRank vs hiring an SEO agency (price + feature table + when-to-pick-each)
- [x] `/vs-podium` — HeatRank vs Podium (HVAC-focus + 80% cheaper)
- [x] `/vs-birdeye` — HeatRank vs Birdeye (HVAC-tuned, no annual contract)

### 10.3 Long-form content (`/resources`)
- [x] `/resources` — quick-tips landing + in-depth guides list
- [x] `/resources/[slug]` — dynamic article pages with Article schema
- [x] 4 in-depth blog articles (~700-1000 words each):
  - "12-Point Google Business Profile Checklist for HVAC Contractors"
  - "HVAC Keyword Strategy in 2026: What Still Works"
  - "How to Respond to Negative Reviews (HVAC + 5 Templates)"
  - "Schema Markup for HVAC Sites: A Plain-English Guide"
- [x] `/glossary` — 22 HVAC SEO terms in plain English

### 10.4 Free SEO tools (lead magnets)
- [x] `/tools` — landing page (3 tools listed)
- [x] `/tools/title-tag-checker` — live SERP preview, 5 grading checks (length, HVAC keyword, brand suffix, title case, word count), letter grade
- [x] `/tools/meta-description-generator` — 3 variant templates per click (service + city + brand), copy-to-clipboard
- [x] `/tools/keyword-density` — uni/bigram analyzer with stopword filter + missing-HVAC-term flagging
- [x] All tools client-side only (no signup, no API calls — pure lead magnets)

### 10.5 Trust + transparency pages
- [x] `/about` — founder story + values + no-contracts pitch
- [x] `/contact` — support email cards (support@heatrankai.com)
- [x] `/faq` — dedicated FAQ page reusing the homepage accordion
- [x] `/case-studies` — 3 HVAC contractor case studies with metrics + quotes
- [x] `/integrations` — 8 live integrations + 6 coming-soon (GBP, Stripe, Resend, Supabase, Gemini, Mapbox, etc.)
- [x] `/roadmap` — public roadmap (Shipped / In progress / Next up / Future)
- [x] `/changelog` — versioned release notes (v1.0 → v1.4)

### 10.6 SEO infrastructure
- [x] `metadataBase: new URL("https://www.heatrankai.com")` in layout
- [x] Canonical URLs on all marketing pages (`alternates.canonical`)
- [x] Twitter Card metadata on all major pages
- [x] Dynamic OG images via `next/og` `ImageResponse` for homepage + city pages (1200×630)
- [x] `sitemap.ts` auto-generates URLs from `CITIES` + `ARTICLES` data + static routes
- [x] `robots.ts` allows all crawlers, points to sitemap.xml
- [x] Article schema (`@type: Article`) on blog posts
- [x] Pricing page money-back guarantee card
- [x] Founding member offer with claimed-counter on homepage

### 10.7 Newsletter capture
- [x] `Newsletter` component (email capture, success/error states)
- [x] `/api/newsletter` — writes to `newsletter_subscribers` table (silent OK if table missing)
- [x] Widget added to homepage footer
- [ ] **Required setup:** Supabase table `newsletter_subscribers (email text primary key, subscribed_at timestamptz, source text)` — must be created manually in production

### 10.8 Mobile + accessibility
- [x] `MobileNav` slide-out drawer (15 links + sign-in CTAs)
- [x] `StickyMobileCTA` appears after 600px scroll, dismissible
- [x] Skip-to-content link in `layout.tsx` (focusable, sr-only when not focused)
- [x] `prefers-reduced-motion` global CSS rule (disables animations for motion-sensitive users)
- [x] Better `:focus-visible` rings (amber 2px outline) for keyboard nav
- [x] `<main id="main">` target for skip link

### 10.9 Quality + error handling
- [x] `app/global-error.tsx` — root error boundary outside the layout
- [x] `app/not-found.tsx` — branded 404 with popular city links + sign-in CTA
- [x] `app/(app)/dashboard/loading.tsx` — skeleton (stat cards + columns)
- [x] `app/(app)/citations/loading.tsx` — skeleton rows
- [x] `src/app/icon.png` + `apple-icon.png` (Next.js file convention) — replaces Vercel favicon
- [x] Migrated `src/middleware.ts` → `src/proxy.ts` (Next.js 16 convention)

### 10.10 Live-site bug fixes (2026-05-07)
- [x] Vercel ▲ favicon replaced with HeatRank logo via `app/icon.png` + `app/apple-icon.png`
- [x] Keyword AI now HVAC-only (was producing generic keywords for non-HVAC business names);
      Suggest seeds rebuilt around HVAC + business name; temperature 0.4; 9/12 location-tagged required
- [x] Run Snapshot disabled when GBP not connected (server returns 422 `GBP_NOT_CONNECTED`,
      UI shows amber CTA banner) — no more wasted credits on guesses
- [x] GBP OAuth callback surfaces specific reasons: `gbp_no_accounts`, `gbp_no_locations`,
      `gbp_api_error` with friendly messages on `/reviews`
- [x] `getGBPStatus` switched from `.single()` → `.maybeSingle()` to stop throwing
      when user has no integration row (was triggering "Reviews failed to load")

---

## 🔧 Global Engineering Standards

### Code Conventions (Non-Negotiable)
- All API routes: `console.error` for every caught exception
- All mutations: `router.refresh()` after success
- Server Actions preferred over API routes for simple CRUD
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client
- All DB writes enforced by RLS — test with `anon` role before shipping
- Every route segment: add an `error.tsx` file

### Target File Structure
```
src/
  app/
    (marketing)/          # Public pages, own layout, no auth
      page.tsx            # Landing page
      pricing/page.tsx
      layout.tsx
    (app)/                # Authenticated app, shared sidebar layout
      dashboard/
      settings/
      onboarding/
      layout.tsx
    admin/                # SuperAdmin, separate layout + role check
    api/
      dodo/webhook/route.ts
      dodo/checkout/route.ts
      reviews/fetch/route.ts
      reviews/generate-reply/route.ts
      crawl/route.ts
      generate-keywords/route.ts
      demo-keywords/route.ts
  components/
    ui/                   # Primitives: Button, Badge, Card, Input, Modal
    paywall/              # UpgradeGate, UsageBar, PlanBadge
    charts/               # RankHeatmap, RatingDistribution
  lib/
    supabase/             # server.ts, client.ts (existing)
    stripe.ts             # Stripe singleton
    gemini.ts             # Gemini singleton + shared prompt helpers
    usage.ts              # checkUsageAllowed, incrementUsage
  utils/
    url.ts                # validateUrl, normalizeUrl
    nap.ts                # NAP comparison utilities
```

### Full Environment Variables Reference
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # Server-side ONLY

# Gemini
GEMINI_API_KEY=

# Dodo Payments
DODO_PAYMENTS_API_KEY=
DODO_PAYMENTS_WEBHOOK_SECRET=
DODO_PRODUCT_STARTER_MONTHLY=
DODO_PRODUCT_STARTER_YEARLY=
DODO_PRODUCT_PRO_MONTHLY=
DODO_PRODUCT_PRO_YEARLY=
DODO_PRODUCT_AGENCY_MONTHLY=
DODO_PRODUCT_AGENCY_YEARLY=

# Google (Phase 3+)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_MAPS_API_KEY=

# Email (Phase 7)
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
ADMIN_USER_ID=                      # Founder's Supabase user_id for /admin gate
```

---

## 📅 Suggested 6-Month Sprint Plan

| Month | Focus | Phases |
|---|---|---|
| 1 | Ship publicly, acquire first beta users | Phase 1 polish (Trial CTA, Privacy/ToS), Phase 2 (Onboarding ✅), pre-launch settings fixes |
| 2 | First payment — this is the #1 milestone | Phase 6 ✅ Dodo Payments live + 14-day trial + paywalls, Phase 3 review engine polish |
| 3 | Expand SEO toolset | Phase 5 (Crawler), Phase 9.1 (Citations MVP) |
| 4 | Rank tracking live + competitors | Phase 4 (live Google Places snapshots, competitor spy) |
| 5 | Retention + agency push | Phase 7 (PDF reports), Phase 9.5 (White-label MVP) |
| 6 | Automation + admin polish | Phase 8 (SuperAdmin), Phase 9.3 (GBP Post Scheduler) |

---

## ✅ Immediate Next Actions (This Week)

- [x] Fix `indigo-*` color leaks in `dashboard/page.tsx` (lines 34, 35, 65, 81, 167, 176)
- [x] Add `ai_usage` table to Supabase + rate-limit check in `/api/generate-keywords`
- [x] Add server-side `website_url` validation (`new URL()`) before any crawl
- [x] Create `(marketing)` route group and scaffold landing page
- [x] Create `(app)` route group with sidebar layout shell
- [x] Add `error.tsx` to `/dashboard` route segment
- [x] Migrate dashboard into `(app)` route group — remove inline header, wire up Sidebar (Phase 2.2 + 2.5)
- [x] Add `G+D` / `G+S` keyboard shortcuts to Sidebar (Phase 2.5)
- [x] Dashboard empty state — onboarding CTA for users with no businesses yet (Phase 2.2)
- [x] JSON-LD Schema Markup Generator (`/schema`) — live at sidebar nav item (Phase 9.2)
- [x] Settings page: Profile, API Usage, Billing, Danger Zone tabs (Phase 2.4)
- [x] Fix logo in Sidebar — links to /dashboard (context-aware, not landing page)
- [x] Plan badge in Sidebar deep-links to /settings?tab=billing with tab pre-selection
- [x] Complete Phase 1.2 Auth Flow: `/auth/error` page + check `/auth/callback` new-user redirect to `/onboarding`
- [x] `profiles` table migration + auto-create trigger on signup (`20260502000003_add_profiles.sql`)
- [x] Centralized auth guard in `(app)/layout.tsx` — single redirect, no per-page duplication
- [x] Phase 2.1 onboarding wizard: 3-step wizard + skip + `onboarding_complete` flag
- [x] **Settings quick-fixes:** billing "$49" → "$69"; remove "Phase 6 coming"; usage limits 2 kw→1, 5 reply→3; "FREE" badge → "STARTER"
- [x] **UI label cleanup:** "Phase 4" removed from `/rank`; "Phase 3.4" removed from `/reviews`
- [x] **Landing page:** header CTA "Start Free" → "Start Free Trial"
- [x] Add Privacy Policy + Terms of Service pages — live at `/privacy` and `/terms`
- [x] **SAB checkbox** — BusinessForm.tsx'e "Service Area Business" toggle + `businesses.is_service_area_business` migration
- [x] **HVAC keyword chips** — rank sayfası keyword input'una tıklanabilir chip önerileri
- [x] **Test Mode badge** — rank mock data görünürken "Try free, no credits used" rozeti (`is_mock` flag)
- [x] **14-day trial + countdown banner** — `profiles.trial_ends_at` + auto-downgrade + sticky banner + Dodo webhook clears trial on payment (Phase 6.2)
- [x] **Activation Checklist kartı** — dashboard'a "Add Business → Connect GBP → Run First Scan" adım kartı
- [x] **Sidebar usage widget** — "Replies: 2/3" göstergesi sidebar'a taşındı (sadece Starter plan)
- [x] **GBP production approval** — Google OAuth uygulaması doğrulandı, production'da
- [x] Multi-business selector: rank + schema sayfalarında URL-based `BusinessSwitcher` dropdown
- [x] Add `loading.tsx` skeleton to `/reviews`, `/rank`, `/schema`, `/settings`
- [x] Add `error.tsx` to `/rank` (others already existed)
- [x] Wire `profiles.full_name` to Settings: reads from `profiles` (falls back to auth metadata), saves to both
- [x] Apply pending Supabase migrations (run `supabase db push`)
- [x] **Dodo Payments live** — checkout + webhook + billing UI wired (Phase 6.1 ✅)
- [x] **usage.ts limits fixed** — keyword_generation: 1/mo, review_reply: 3/mo (matches Phase 6.4 pricing table)
- [x] **Business detail page live** — 5-tab layout (Overview / Keywords / Reviews / SEO Audit / Competitors)
- [x] **Dashboard stats + activity feed** — real review count, recent 3 reviews, quick-action cards
- [x] **Email magic link login** — `/login` adds `signInWithOtp` flow alongside Google OAuth
- [x] **Auto review sync cron** — daily Vercel Cron at `/api/cron/sync-reviews` (Hobby-plan compatible)
- [x] **Day-12 trial expiry email cron** — daily Vercel Cron at `/api/cron/trial-emails`
- [x] **25 city landing pages** (`/hvac-seo/[city]`) for organic local SEO
- [x] **18 state aggregation pages** (`/hvac-seo/state/[state]`) auto-generated from CITIES
- [x] **3 competitor comparison pages** — `/vs-seo-agency`, `/vs-podium`, `/vs-birdeye`
- [x] **3 free SEO tools** — title checker, meta generator, keyword density (lead magnets, no signup)
- [x] **4 long-form blog articles** at `/resources/[slug]` with Article schema
- [x] **Trust + transparency pages** — /about, /contact, /faq, /case-studies, /glossary, /integrations, /roadmap, /changelog
- [x] **Mobile UX** — `MobileNav` drawer + `StickyMobileCTA`
- [x] **A11y** — skip link, prefers-reduced-motion, focus-visible rings
- [x] **Dynamic OG images** via `next/og` for homepage + city pages
- [x] **Canonical URLs + Twitter Cards** on all marketing pages
- [x] **404 page** + `global-error.tsx` root boundary
- [x] **Sitemap auto-generation** from CITIES + ARTICLES data
- [x] **Custom favicon** — `app/icon.png` + `apple-icon.png` (replaces Vercel default)
- [x] **`middleware.ts` → `proxy.ts`** — Next.js 16 convention migration
- [x] **5 live-site bug fixes** — favicon, keyword AI, snapshot gate, GBP errors, reviews crash
- [ ] **Pending:** Create Supabase `newsletter_subscribers` table for newsletter widget to persist
