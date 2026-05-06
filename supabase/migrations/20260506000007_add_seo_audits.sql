CREATE TABLE IF NOT EXISTS seo_audits (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      uuid        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  crawled_url      text        NOT NULL,
  page_title       text,
  meta_description text,
  h1               text,
  h2_count         smallint    NOT NULL DEFAULT 0,
  word_count       integer     NOT NULL DEFAULT 0,
  image_count      smallint    NOT NULL DEFAULT 0,
  images_missing_alt smallint  NOT NULL DEFAULT 0,
  has_schema       boolean     NOT NULL DEFAULT false,
  issues           jsonb       NOT NULL DEFAULT '[]'::jsonb,
  score            smallint    NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  audited_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS seo_audits_business_idx ON seo_audits (business_id, audited_at DESC);

ALTER TABLE seo_audits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see their own audits" ON seo_audits;
CREATE POLICY "Users see their own audits"
  ON seo_audits FOR SELECT
  TO authenticated
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users insert their own audits" ON seo_audits;
CREATE POLICY "Users insert their own audits"
  ON seo_audits FOR INSERT
  TO authenticated
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users delete their own audits" ON seo_audits;
CREATE POLICY "Users delete their own audits"
  ON seo_audits FOR DELETE
  TO authenticated
  USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));
