-- Idempotency table for LemonSqueezy webhook events.
-- Prevents double-processing if LemonSqueezy fires the same event twice.

CREATE TABLE IF NOT EXISTS lemon_events (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id   text        NOT NULL UNIQUE,
  event_name text        NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

-- Only service role can write (webhook handler uses service key).
ALTER TABLE lemon_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lemon_events_deny_client" ON lemon_events;
CREATE POLICY "lemon_events_deny_client" ON lemon_events
  FOR ALL USING (false);
