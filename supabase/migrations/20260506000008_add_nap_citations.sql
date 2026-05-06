-- Canonical NAP fields on businesses (used for citation consistency comparison)
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS phone          text;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS street_address text;

-- Citation tracking table
CREATE TABLE IF NOT EXISTS citations (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id       uuid        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  directory         text        NOT NULL,         -- e.g. "Yelp", "Angi"
  listing_url       text        NOT NULL,
  detected_name     text,
  detected_address  text,
  detected_phone    text,
  nap_consistent    boolean     NOT NULL DEFAULT false,
  diff              jsonb       NOT NULL DEFAULT '{}'::jsonb,  -- { field: { canonical, detected } }
  last_checked_at   timestamptz NOT NULL DEFAULT now(),
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE(business_id, listing_url)
);

CREATE INDEX IF NOT EXISTS citations_business_idx ON citations (business_id, last_checked_at DESC);

ALTER TABLE citations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own citations" ON citations;
CREATE POLICY "Users see own citations"
  ON citations FOR SELECT
  TO authenticated
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users insert own citations" ON citations;
CREATE POLICY "Users insert own citations"
  ON citations FOR INSERT
  TO authenticated
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users update own citations" ON citations;
CREATE POLICY "Users update own citations"
  ON citations FOR UPDATE
  TO authenticated
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users delete own citations" ON citations;
CREATE POLICY "Users delete own citations"
  ON citations FOR DELETE
  TO authenticated
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));
