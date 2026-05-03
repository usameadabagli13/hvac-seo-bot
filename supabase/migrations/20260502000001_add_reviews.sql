-- reviews: persists fetched platform reviews (GBP, Yelp, etc.) per business.
-- Deduplication key: (business_id, platform, review_id)
-- user_id is denormalized onto the row so RLS policies stay simple and fast.

CREATE TABLE reviews (
  id          uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid         REFERENCES auth.users(id)  ON DELETE CASCADE NOT NULL,
  business_id uuid         REFERENCES businesses(id)  ON DELETE CASCADE NOT NULL,
  platform    text         NOT NULL DEFAULT 'Google',
  review_id   text         NOT NULL,        -- platform's own ID (GBP: reviewId field)
  author      text         NOT NULL,
  rating      smallint     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body        text         NOT NULL DEFAULT '',
  sentiment   text         NOT NULL DEFAULT 'neutral'
                           CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  ai_reply    text,                          -- NULL until an AI draft is accepted
  replied_at  timestamptz,                   -- NULL until reply is posted to platform
  review_date date         NOT NULL,         -- date the customer wrote the review
  fetched_at  timestamptz  DEFAULT now() NOT NULL,
  UNIQUE (business_id, platform, review_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_select" ON reviews;
CREATE POLICY "reviews_select" ON reviews
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "reviews_insert" ON reviews;
CREATE POLICY "reviews_insert" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reviews_update" ON reviews;
CREATE POLICY "reviews_update" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "reviews_delete" ON reviews;
CREATE POLICY "reviews_delete" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Index: most common query pattern is fetching all reviews for a business
CREATE INDEX reviews_business_date_idx ON reviews (business_id, review_date DESC);
-- Index: feed queries filter by user across all businesses
CREATE INDEX reviews_user_date_idx    ON reviews (user_id, review_date DESC);
