# PROJECT_MASTER.md — HVAC SEO Bot
> **Living document. Update checkboxes as features ship. Last reviewed: 2026-05-02.**

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
businesses (id, user_id, business_name, service_location, website_url, target_keywords jsonb, created_at)

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
profiles.plan (column added to profiles: 'starter' | 'pro' | 'agency', default 'starter')
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
- [x] Hero section — headline, sub-headline, single CTA ("Start Free")
- [x] Live keyword demo widget (show AI keywords without signing up — calls rate-limited `/api/demo-keywords`)
- [x] Features grid — 6 features, icon + copy, zinc card style
- [x] Pricing section — Free / Pro / Agency tiers
- [x] Social proof — 3 realistic testimonials with avatar initials
- [x] FAQ accordion (5 questions covering trust objections)
- [x] Footer — links, legal, copyright

### 1.2 Auth Flow
- [x] `/login` — Google OAuth button (Google-only, no password flow)
- [x] `/auth/callback` — Redirect to `/onboarding` for new users, `/dashboard` for returning
- [x] `/auth/error` — Friendly error page for failed OAuth states
- [ ] `/forgot-password` — N/A (Google OAuth only; re-evaluate if email auth added later)

### 1.3 Waitlist / Lead Capture
- [ ] `waitlist` table: `(id, email, name, company, source, created_at)`
- [ ] Embedded form on landing page (no auth required)
- [ ] POST `/api/waitlist` → insert + welcome email via Resend
- [ ] Admin view in Phase 8

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

### 2.3 Business Detail Page (`/dashboard/businesses/[id]`)
- [x] Tabbed layout: Overview / Keywords / Reviews / SEO Audit / Competitors
- [ ] Edit business form (inline edit on detail page)
- [ ] Soft delete with `deleted_at` column (RLS filters it out)

### 2.4 Settings (`/settings`)
- [x] Profile tab: display name (saved to auth metadata), email (read-only)
- [x] API Usage tab: visual usage bars per feature with monthly reset date
- [x] Billing tab: current plan badge + Dodo Payments checkout buttons (live)
- [x] Danger zone: Delete account with "type DELETE" confirmation + cascade
- [ ] Avatar upload to Supabase Storage (deferred — needs Storage bucket setup)
- [ ] Dodo Customer Portal self-serve link for cancellation/billing management

### 2.5 Navigation Shell
- [x] Sidebar (desktop) + bottom nav (mobile)
- [x] Active route highlight
- [x] Plan badge in sidebar (Free / Pro / Agency)
- [x] Keyboard shortcuts: `G+D` = Dashboard, `G+R` = Reviews, `G+K` = Rank Tracker, `G+S` = Settings

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
- [ ] "SAMPLE DATA" badge on mock data cards — show when GBP not connected
- [ ] "This uses 1 credit" tooltip/warning before generating a reply (freemium UX)

### 3.1 GBP OAuth Integration
- [x] `integrations` table with RLS (migration `20260501000001_add_integrations.sql`)
- [x] `/api/auth/gbp` — initiates OAuth with `business.manage` scope + CSRF state cookie
- [x] `/api/auth/gbp/callback` — exchanges code, resolves first account/location, upserts tokens
- [x] `/api/auth/gbp/disconnect` — deletes integration row (POST)
- [x] `src/lib/gbp.ts` — `getValidToken` (auto-refresh), `getGBPReviews`, `getGBPStatus`
- [x] On-demand token refresh (5-min lookahead) — replaces cron for Phase 3.1
- [x] `GBPConnectBanner` component — connect / connected+disconnect / api-error states
- [x] Reviews page wired: live GBP data when connected, graceful fallback to mock on error
- [ ] Multi-location selector (currently auto-picks first location)
- [ ] Supabase Vault encryption for stored tokens (security hardening)

### 3.2 Review Fetcher
- [x] `/api/reviews/fetch` — calls GBP API, upserts into `reviews` table
- [x] Deduplication via `UNIQUE(business_id, platform, review_id)`
- [x] Reviews page reads from DB first; "Sync Reviews" button triggers manual re-fetch
- [ ] Daily background sync via Supabase Edge Function (automated — Phase 3.2 stretch)

### 3.3 Sentiment Analysis Dashboard
- [x] Gemini classifies each review: `positive | neutral | negative` (batch, single API call per sync)
- [x] Result stored in `reviews.sentiment` — written during sync, not post-insert
- [x] Rating distribution chart (1★–5★ bar chart with colour-coded bars)
- [x] Filter by: rating, sentiment, date, replied/unreplied (done in 3.0 shell)
- [ ] 1-sentence AI summary per review (requires `sentiment_summary` column — Phase 3.3 stretch)

### 3.4 AI Reply Generator
- [x] "Generate Reply" button per review → POST `/api/reviews/generate-reply`
- [x] Gemini prompt: "Expert Technician + Customer First" tone, adapts to star rating
- [x] Tone shifts: positive (gratitude) / neutral (acknowledge + improve) / negative (apology + action)
- [x] Editable textarea draft — user can tweak before posting
- [x] Copy-to-clipboard button with feedback state
- [x] Character count shown in footer
- [x] **Freemium gate:** Free = 5 AI replies/month (tracked in `ai_usage` table)
- [x] "Post to Google" stub — enabled once Phase 3.1 GBP posting is wired
- [x] Save Reply button — saves `ai_reply` + sets `is_replied = true` in DB, triggers router.refresh()
- [ ] 3 reply variants (formal / friendly / apologetic) — Phase 3.4 full
- [ ] Post reply via GBP API write — needs GBP OAuth production approval (Phase 3.4 full)

---

## Phase 4: Local Rank & Competitor Spy 🚧 IN PROGRESS

**Goal:** The visual "wow" feature that justifies a Pro subscription renewal every month.

### 4.1 Grid-Based Local Rank Heatmap
- [ ] Business + keyword dropdown selectors (currently hardcoded to first business)
- [ ] User sets a target keyword per business (UI + DB column)
- [ ] Generate 5×5 grid of lat/lng points around business (1-mile spacing)
- [ ] Call Google Places Text Search API for each grid point (25 calls per snapshot)
- [x] DB migration: `rank_snapshots` table with RLS (`20260501000002_phase4_rank_competitors.sql`)
- [x] Mock data + dev seed route (`/api/rank/seed-mock`, `src/lib/mock-rank-snapshots.ts`)
- [x] Render heatmap on Mapbox GL (circle + heatmap + symbol layers, dark-v11 style)
- [x] Click-to-popup: rank, tier, trend delta
- [x] Historical trend arrows (prev snapshot comparison)
- [ ] "Run Snapshot" button → live Google Places API calls
- **⚠️ Cost trap:** 25 API calls × price per call × users × keywords. Cache aggressively. Free = monthly snapshots only.

### 4.2 Competitor Tracker
- [ ] User adds up to 3 competitor Place IDs
- [ ] Fetch: avg rating, review count, GBP description keywords
- [ ] Side-by-side comparison table
- [ ] "Keyword gap" analysis: what competitors rank for that the user lacks

---

## Phase 5: On-Page SEO Crawler

**Goal:** Concrete, actionable to-do list that delivers immediate felt value.

### 5.1 Website Crawler (`/api/crawl`)
- [ ] Server-side `fetch()` of `website_url`
- [x] Validate URL with `new URL()` before crawling (Critique #3)
- [ ] Parse: `<title>`, `<h1>`, `<h2>`, `<meta description>`, body text, image alt tags
- [ ] Handle redirects, 5s timeout, non-HTML responses
- [ ] Check `robots.txt` before crawling (legal + ethical requirement)
- [ ] Store in `seo_audits` table

### 5.2 SEO Gap Analyzer (Gemini)
- [ ] Send page data + `target_keywords` to Gemini
- [ ] Returns `{ issues: [{severity, element, current, recommended}] }` as JSON
- [ ] Example: "Missing 'Dallas HVAC repair' in H1", "Meta description only 42 chars"
- [ ] Calculate score 0–100 based on issue count and severity
- [ ] Render as prioritized checklist: Critical / Warning / Info badges
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
- [ ] Add `trial_ends_at timestamptz` to `subscriptions` table (or as a separate column on `profiles`)
- [ ] On first signup: set `trial_ends_at = now() + interval '14 days'`
- [ ] Day 12: email via Resend — "2 days left in your trial"
- [ ] Day 14: account frozen (read-only) — middleware checks `trial_ends_at < now()` and `status != 'active'`
- [ ] Frozen state: banner + upgrade CTA on every app page

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
- [ ] `<UpgradeGate feature="..." />` — blurred overlay with "Upgrade to Pro" CTA
- [ ] `<UsageBar feature="..." />` — bar for settings page
- [ ] `<PlanBadge />` — sidebar plan indicator
- [ ] `/pricing` page with annual toggle (2 months free)
- [ ] Payment portal link for self-serve cancellation (Dodo Payments customer portal)

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
- [ ] `/admin` protected by middleware: check `profiles.role = 'admin'`
- [ ] Role set manually via Supabase Studio for founder's account
- [ ] Never use client-side role checks — always verify server-side

### 8.2 Admin Dashboard (`/admin`)
- [ ] MRR tracker (Stripe API → sum of active subscriptions)
- [ ] Daily signup chart (30-day rolling)
- [ ] Churn rate (cancellations last 30 days / total active)
- [ ] Top features by usage (query `ai_usage` grouped by feature)
- [ ] Error log (query `admin_audit_log` for errors)
- [ ] Waitlist manager (view + CSV export)
- [ ] User lookup by email: plan, usage, businesses

### 8.3 System Health Panel
- [ ] Gemini API quota status
- [ ] Supabase DB size + row counts per table
- [ ] Failed Dodo webhook events list

---

## Phase 9: Architect's Strategic Additions

> Features the original plan missed — these are the real competitive moats.

### 9.1 NAP Citation Manager ⭐ HIGH PRIORITY
**Why:** NAP (Name, Address, Phone) consistency across 80+ directories (Yelp, Angi, HomeAdvisor, BBB, YellowPages) is a top-3 local ranking factor. No competitor does this cleanly.
- [ ] `citations` table: directory, listing_url, detected NAP, consistency flag
- [ ] User pastes directory listing URL → Gemini extracts the NAP from the page
- [ ] Consistency checker: compare vs. canonical NAP stored on `businesses`
- [ ] Score: "Your NAP is consistent on 61/80 directories"
- [ ] For each inconsistent listing: show exact URL to fix + field-by-field diff
- [ ] Pro: auto-submit to free directories (Bing Places, Apple Maps, Nextdoor)

### 9.2 JSON-LD Schema Markup Generator ⭐ QUICK WIN
**Why:** HVAC businesses universally have zero structured data. 30-minute build, massive perceived value.
- [x] Generate `LocalBusiness` + `HVACBusiness` JSON-LD from business profile data
- [x] Include: name, address, phone, location, openingHours, priceRange, areaServed
- [x] One-click copy to clipboard (copies full `<script>` tag)
- [x] CMS-tailored embed instructions (WordPress snippet vs. raw HTML `<head>` tag)
- [ ] Business selector dropdown (multi-business support — currently hardcoded to first)
- [ ] "Test with Google Rich Results" external link → validates the generated schema
- [ ] Weekend hours support (Sat/Sun checkbox + time inputs)
- [ ] Store in `schema_markup` table with version history (Phase 9.2 full)

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
- [ ] Add Privacy Policy + Terms of Service pages (footer links go to `/privacy` and `/terms` — currently 404)
- [ ] **Mobile responsive pass** — test all pages at 390px (Chrome DevTools): overflow, touch targets ≥44px, font sizes
- [ ] **GBP production approval başvurusu** — Google 4-8 hafta sürüyor, şimdi başla
- [ ] **14-day trial** — `trial_ends_at` column on profiles + middleware freeze (Phase 6.2) ← EN ACİL
- [ ] Multi-business selector: rank + schema sayfalarında dropdown
- [x] Add `loading.tsx` skeleton to `/reviews`, `/rank`, `/schema`, `/settings`
- [x] Add `error.tsx` to `/rank` (others already existed)
- [x] Wire `profiles.full_name` to Settings: reads from `profiles` (falls back to auth metadata), saves to both
- [x] Apply pending Supabase migrations (run `supabase db push`)
- [x] **Dodo Payments live** — checkout + webhook + billing UI wired (Phase 6.1 ✅)
- [x] **usage.ts limits fixed** — keyword_generation: 1/mo, review_reply: 3/mo (matches Phase 6.4 pricing table)
- [x] **Business detail page live** — 5-tab layout (Overview / Keywords / Reviews / SEO Audit / Competitors)
- [x] **Dashboard stats + activity feed** — real review count, recent 3 reviews, quick-action cards
