-- Add plan tier to profiles. Default 'starter' (trial).
-- LemonSqueezy webhook updates this column on payment success/cancellation.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'starter'
    CHECK (plan IN ('starter', 'pro', 'agency'));
