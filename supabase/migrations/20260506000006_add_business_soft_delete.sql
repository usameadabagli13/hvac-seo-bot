ALTER TABLE businesses ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
CREATE INDEX IF NOT EXISTS businesses_active_idx ON businesses (user_id) WHERE deleted_at IS NULL;
