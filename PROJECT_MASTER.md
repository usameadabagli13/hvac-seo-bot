# PROJECT_MASTER.md — HVAC SEO Bot
> **Living document. Update checkboxes as features ship. Last reviewed: 2026-04-30.**

---

## 🏗 Stack Snapshot

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) | React 19, Server Components by default |
| Auth + DB | Supabase (PostgreSQL + RLS) | `@supabase/ssr` v0.10 |
| AI | Gemini 2.5 Flash | JSON mode enforced |
| Styling | Tailwind CSS v4 | Monochromatic zinc palette — **NO purple/indigo** |
| Payments | Stripe (planned) | Webhooks via Next.js API routes |
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

### 5. Stripe Webhook Idempotency Trap
Stripe can fire the same webhook event twice. Every webhook handler **must** use `stripe_event_id` as a unique key with an `ON CONFLICT DO NOTHING` upsert — or users get double-upgraded.

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
subscriptions (id, user_id, stripe_customer_id, stripe_subscription_id, plan text, status text, current_period_end timestamptz)
ai_usage (id, user_id, feature text, count int, period_start date, UNIQUE(user_id, feature, period_start))
stripe_events (id, stripe_event_id text UNIQUE, processed_at timestamptz)  -- idempotency

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
- [ ] Hero section — headline, sub-headline, single CTA ("Start Free")
- [ ] Live keyword demo widget (show AI keywords without signing up — calls rate-limited `/api/demo-keywords`)
- [ ] Features grid — 6 features, icon + copy, zinc card style
- [ ] Pricing section — Free / Pro / Agency tiers
- [ ] Social proof — 3 realistic testimonials with avatar initials
- [ ] FAQ accordion (5 questions covering trust objections)
- [ ] Footer — links, legal, copyright

### 1.2 Auth Flow
- [ ] `/login` — Google OAuth button + email magic link option
- [ ] `/signup` — Same flow (Supabase handles both)
- [ ] `/forgot-password` — Email reset form
- [ ] `/auth/callback` — Redirect to `/onboarding` for new users, `/dashboard` for returning
- [ ] `/auth/error` — Friendly error page for failed OAuth states

### 1.3 Waitlist / Lead Capture
- [ ] `waitlist` table: `(id, email, name, company, source, created_at)`
- [ ] Embedded form on landing page (no auth required)
- [ ] POST `/api/waitlist` → insert + welcome email via Resend
- [ ] Admin view in Phase 8

---

## Phase 2: Core Dashboard & Onboarding

**Goal:** First-run experience that reaches "aha moment" in under 3 minutes.

### 2.1 Onboarding Flow (`/onboarding`)
- [ ] Multi-step wizard: Profile → Add Business → Generate Keywords → Done
- [ ] `profiles.onboarding_complete` bool — middleware redirects new users here
- [ ] Skip option with reminder banner
- [ ] Step indicator (dots, not percentage bar)

### 2.2 Dashboard Home (`/dashboard`)
- [ ] Fix `indigo-*` color leaks (see Critique #2 above)
- [ ] Global stats: Businesses, Keywords Tracked, Reviews Fetched, Avg Rating
- [ ] Recent activity feed (last 5 actions across all businesses)
- [ ] Quick-action buttons: Add Business, Generate Report, View Reviews
- [ ] Empty state with onboarding CTA for new users

### 2.3 Business Detail Page (`/dashboard/businesses/[id]`)
- [ ] Tabbed layout: Overview / Keywords / Reviews / SEO Audit / Competitors
- [ ] Edit business form
- [ ] Soft delete with `deleted_at` column (RLS filters it out)

### 2.4 Settings (`/dashboard/settings`)
- [ ] Profile tab: name, avatar upload to Supabase Storage
- [ ] API Usage tab: visual usage bars per feature with reset date
- [ ] Billing tab: current plan badge, Stripe Customer Portal link
- [ ] Danger zone: Delete account with cascade

### 2.5 Navigation Shell
- [ ] Sidebar (desktop) + bottom nav (mobile)
- [ ] Active route highlight
- [ ] Plan badge in sidebar (Free / Pro / Agency)
- [ ] Keyboard shortcuts: `G+D` = Dashboard, `G+S` = Settings

---

## Phase 3: Review & Reputation Engine

**Goal:** The feature HVAC owners will pay for on day one — responding to Google reviews is their #1 pain point.

### 3.1 GBP OAuth Integration
- [ ] Add `business.manage` scope to Google OAuth
- [ ] Store access token + refresh token in `integrations` table (Supabase Vault encrypted)
- [ ] Token refresh cron every 50 min (tokens expire at 60 min)
- [ ] "Connect Google Business Profile" button in business settings

### 3.2 Review Fetcher
- [ ] `/api/reviews/fetch` — calls GBP API, upserts into `reviews` table
- [ ] Deduplication via `UNIQUE(business_id, platform, review_id)`
- [ ] Daily background sync via Supabase Edge Function

### 3.3 Sentiment Analysis Dashboard
- [ ] Gemini classifies each review: `positive | neutral | negative` + 1-sentence summary
- [ ] Result stored in `reviews.sentiment` (run once per review, cached)
- [ ] Rating distribution chart (1★–5★ bar chart)
- [ ] Filter by: rating, sentiment, date, replied/unreplied

### 3.4 AI Reply Generator
- [ ] "Generate Reply" button per review → POST `/api/reviews/generate-reply`
- [ ] Returns 3 reply variants (formal / friendly / apologetic)
- [ ] User picks, edits inline, posts via GBP API write
- [ ] **Freemium gate:** Free = 5 AI replies/month

---

## Phase 4: Local Rank & Competitor Spy

**Goal:** The visual "wow" feature that justifies a Pro subscription renewal every month.

### 4.1 Grid-Based Local Rank Heatmap
- [ ] User sets a target keyword per business
- [ ] Generate 5×5 grid of lat/lng points around business (1-mile spacing)
- [ ] Call Google Places Text Search API for each grid point (25 calls per snapshot)
- [ ] Store results in `rank_snapshots` table
- [ ] Render heatmap: green (rank 1–3), yellow (4–10), red (11+)
- [ ] Historical trend arrows (weekly snapshots on Pro)
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
- [ ] Validate URL with `new URL()` before crawling (Critique #3)
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

### 6.1 Stripe Integration
- [ ] `npm install stripe`
- [ ] Create products in Stripe Dashboard: Free / Pro ($49/mo) / Agency ($149/mo)
- [ ] `/api/stripe/create-checkout` — creates Stripe Checkout session (Server Action)
- [ ] `/api/stripe/webhook` — handles: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- [ ] Idempotency: upsert `stripe_events(stripe_event_id UNIQUE)` on every webhook (Critique #5)
- [ ] Update `subscriptions` table on every event

### 6.2 Usage Tracking Utilities (`src/lib/usage.ts`)
- [ ] `incrementUsage(userId, feature)` — atomic `UPDATE count + 1`
- [ ] `checkUsageAllowed(userId, feature)` — compare count vs. plan limit
- [ ] Wire into every AI route before calling Gemini

### 6.3 Freemium Limits Matrix

| Feature | Free | Pro | Agency |
|---|---|---|---|
| Businesses | 1 | 10 | Unlimited |
| AI Keyword Generations | 2/mo | Unlimited | Unlimited |
| AI Review Replies | 5/mo | Unlimited | Unlimited |
| SEO Audits | 1/mo | Unlimited | Unlimited |
| Rank Snapshots | Monthly | Weekly | Daily |
| Competitor Tracking | — | 3 | 10 |
| PDF Reports | — | Weekly | Daily |
| White-Label Reports | — | — | ✓ |

### 6.4 Paywall UI Components
- [ ] `<UpgradeGate feature="..." />` — blurred overlay with "Upgrade to Pro" CTA
- [ ] `<UsageBar feature="..." />` — bar for settings page
- [ ] `<PlanBadge />` — sidebar plan indicator
- [ ] `/pricing` page with annual toggle (2 months free)
- [ ] Stripe Customer Portal link for self-serve cancellation

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
- [ ] Failed Stripe webhook events list

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
- [ ] Generate `LocalBusiness` + `HVACBusiness` JSON-LD from business profile data
- [ ] Include: name, address, phone, geo, openingHours, priceRange, sameAs, aggregateRating
- [ ] One-click copy to clipboard
- [ ] CMS-tailored embed instructions (WordPress snippet vs. raw HTML `<head>` tag)
- [ ] Store in `schema_markup` table with version history

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
      stripe/webhook/route.ts
      stripe/create-checkout/route.ts
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

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

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
| 1 | Ship publicly, acquire first users | Phase 1 (Landing), Phase 2 (Onboarding polish) |
| 2 | First paid feature | Phase 6 (Stripe + paywalls), Phase 3 (Review engine MVP) |
| 3 | Expand SEO toolset | Phase 5 (Crawler), Phase 9.2 (Schema generator), Phase 9.1 (Citations MVP) |
| 4 | Rank tracking | Phase 4 (Heatmap + competitors) |
| 5 | Retention + agency push | Phase 7 (PDF reports), Phase 9.5 (White-label MVP) |
| 6 | Automation + admin polish | Phase 8 (SuperAdmin), Phase 9.3 (GBP Post Scheduler) |

---

## ✅ Immediate Next Actions (This Week)

- [ ] Fix `indigo-*` color leaks in `dashboard/page.tsx` (lines 34, 35, 65, 81, 167, 176)
- [ ] Add `ai_usage` table to Supabase + rate-limit check in `/api/generate-keywords`
- [ ] Add server-side `website_url` validation (`new URL()`) before any crawl
- [ ] Create `(marketing)` route group and scaffold landing page
- [ ] Create `(app)` route group with sidebar layout shell
- [ ] Add `error.tsx` to `/dashboard` route segment
