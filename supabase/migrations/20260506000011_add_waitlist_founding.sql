ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS is_founding boolean NOT NULL DEFAULT false;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS coupon_code text;

CREATE INDEX IF NOT EXISTS waitlist_founding_idx ON waitlist (is_founding) WHERE is_founding = true;
