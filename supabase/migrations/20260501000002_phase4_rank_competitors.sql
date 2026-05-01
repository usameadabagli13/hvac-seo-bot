-- =============================================================
-- Migration: Phase 4 — Rank Snapshots & Competitor Tracker
-- File: supabase/migrations/20260501000002_phase4_rank_competitors.sql
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. rank_snapshots
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.rank_snapshots (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     uuid          NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  keyword         text          NOT NULL CHECK (char_length(keyword) BETWEEN 1 AND 200),
  lat             numeric(10,7) NOT NULL CHECK (lat BETWEEN -90  AND  90),
  lng             numeric(10,7) NOT NULL CHECK (lng BETWEEN -180 AND 180),
  rank_position   smallint      CHECK (rank_position BETWEEN 1 AND 100),  -- NULL = not ranked
  grid_size       smallint      NOT NULL DEFAULT 5 CHECK (grid_size IN (3, 5, 7)),
  snapshot_date   date          NOT NULL DEFAULT CURRENT_DATE,
  created_at      timestamptz   NOT NULL DEFAULT now()
);

-- Deduplicate: one rank reading per (business, keyword, grid point, day)
CREATE UNIQUE INDEX IF NOT EXISTS uq_rank_snapshot
  ON public.rank_snapshots (business_id, keyword, lat, lng, snapshot_date);

-- Fast queries: history for a keyword, latest snapshot per keyword
CREATE INDEX IF NOT EXISTS idx_rank_snapshots_business_keyword
  ON public.rank_snapshots (business_id, keyword, snapshot_date DESC);

-- ─────────────────────────────────────────────────────────────
-- 2. competitors
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.competitors (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id       uuid        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name              text        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 300),
  place_id          text        NOT NULL CHECK (char_length(place_id) BETWEEN 1 AND 100),
  avg_rating        numeric(3,2) CHECK (avg_rating BETWEEN 1.0 AND 5.0),
  review_count      integer     CHECK (review_count >= 0),
  tracked_keywords  jsonb       NOT NULL DEFAULT '[]'::jsonb,
  last_fetched_at   timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- One Place ID per business (no duplicate competitor rows)
CREATE UNIQUE INDEX IF NOT EXISTS uq_competitor_place
  ON public.competitors (business_id, place_id);

CREATE INDEX IF NOT EXISTS idx_competitors_business_id
  ON public.competitors (business_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_competitors_updated_at ON public.competitors;
CREATE TRIGGER trg_competitors_updated_at
  BEFORE UPDATE ON public.competitors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 3. RLS — rank_snapshots
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.rank_snapshots ENABLE ROW LEVEL SECURITY;

-- Users can see only snapshots that belong to their own businesses
CREATE POLICY "rank_snapshots: owner select"
  ON public.rank_snapshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = rank_snapshots.business_id
        AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "rank_snapshots: owner insert"
  ON public.rank_snapshots FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = rank_snapshots.business_id
        AND b.user_id = auth.uid()
    )
  );

-- No UPDATE — snapshots are immutable; delete is allowed for cleanup
CREATE POLICY "rank_snapshots: owner delete"
  ON public.rank_snapshots FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = rank_snapshots.business_id
        AND b.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 4. RLS — competitors
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "competitors: owner select"
  ON public.competitors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = competitors.business_id
        AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "competitors: owner insert"
  ON public.competitors FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = competitors.business_id
        AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "competitors: owner update"
  ON public.competitors FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = competitors.business_id
        AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "competitors: owner delete"
  ON public.competitors FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = competitors.business_id
        AND b.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 5. AI Usage tables (Phase 6 prereq — needed for rank/competitor gating)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id            uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature       text    NOT NULL CHECK (feature IN (
                          'keyword_generation',
                          'review_reply',
                          'seo_audit',
                          'rank_snapshot',
                          'competitor_fetch'
                        )),
  count         integer NOT NULL DEFAULT 0 CHECK (count >= 0),
  period_start  date    NOT NULL DEFAULT date_trunc('month', CURRENT_DATE)::date,
  UNIQUE (user_id, feature, period_start)
);

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_usage: owner select"
  ON public.ai_usage FOR SELECT
  USING (user_id = auth.uid());

-- Only server-side (service role) may write — no user INSERT/UPDATE policy

-- ─────────────────────────────────────────────────────────────
-- 6. increment_ai_usage — atomic upsert, returns new count
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.increment_ai_usage(
  p_user_id  uuid,
  p_feature  text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_count integer;
  v_period    date := date_trunc('month', CURRENT_DATE)::date;
BEGIN
  INSERT INTO public.ai_usage (user_id, feature, count, period_start)
    VALUES (p_user_id, p_feature, 1, v_period)
  ON CONFLICT (user_id, feature, period_start)
    DO UPDATE SET count = ai_usage.count + 1
  RETURNING count INTO v_new_count;

  RETURN v_new_count;
END;
$$;

-- Companion: read current usage without incrementing
CREATE OR REPLACE FUNCTION public.get_ai_usage(
  p_user_id  uuid,
  p_feature  text
)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT count FROM public.ai_usage
     WHERE user_id    = p_user_id
       AND feature    = p_feature
       AND period_start = date_trunc('month', CURRENT_DATE)::date),
    0
  );
$$;

-- ─────────────────────────────────────────────────────────────
-- 7. Freemium plan limit helper
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.check_usage_allowed(
  p_user_id  uuid,
  p_feature  text
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan  text;
  v_count integer;
  v_limit integer;
BEGIN
  SELECT COALESCE(
    (SELECT plan FROM public.subscriptions
     WHERE user_id = p_user_id
       AND status  = 'active'
     ORDER BY current_period_end DESC
     LIMIT 1),
    'free'
  ) INTO v_plan;

  v_count := public.get_ai_usage(p_user_id, p_feature);

  v_limit := CASE
    WHEN v_plan IN ('pro', 'agency') THEN 2147483647
    ELSE CASE p_feature
      WHEN 'keyword_generation' THEN 2
      WHEN 'review_reply'       THEN 5
      WHEN 'seo_audit'          THEN 1
      WHEN 'rank_snapshot'      THEN 1
      WHEN 'competitor_fetch'   THEN 0
      ELSE 0
    END
  END;

  RETURN v_count < v_limit;
END;
$$;
