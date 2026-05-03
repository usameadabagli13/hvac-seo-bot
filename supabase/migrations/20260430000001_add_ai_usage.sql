-- Phase 6 prerequisite: rate-limit AI feature calls per user per billing period.

CREATE TABLE IF NOT EXISTS ai_usage (
  id            uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature       text    NOT NULL,
  count         integer NOT NULL DEFAULT 0,
  period_start  date    NOT NULL,
  CONSTRAINT ai_usage_user_feature_period_key
    UNIQUE (user_id, feature, period_start)
);

ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

-- Users may only read their own rows.
DROP POLICY IF EXISTS "users_select_own_usage" ON ai_usage;
CREATE POLICY "users_select_own_usage" ON ai_usage
  FOR SELECT USING (auth.uid() = user_id);

-- INSERT / UPDATE are handled exclusively by the SECURITY DEFINER function
-- below, so no direct-write policies are needed for those operations.

-- ---------------------------------------------------------------------------
-- increment_ai_usage
--   Atomically upserts a usage row and bumps the count by 1.
--   SECURITY DEFINER lets it bypass RLS for the write path.
--   The explicit auth.uid() guard prevents any caller from touching another
--   user's row, even via direct RPC invocation.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION increment_ai_usage(
  p_user_id     uuid,
  p_feature     text,
  p_period_start date
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'permission denied: cannot modify another user''s usage';
  END IF;

  INSERT INTO ai_usage (user_id, feature, period_start, count)
  VALUES (p_user_id, p_feature, p_period_start, 1)
  ON CONFLICT (user_id, feature, period_start)
  DO UPDATE SET count = ai_usage.count + 1;
END;
$$;
