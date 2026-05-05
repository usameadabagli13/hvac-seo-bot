ALTER TABLE rank_snapshots
  ADD COLUMN IF NOT EXISTS is_mock boolean NOT NULL DEFAULT false;
