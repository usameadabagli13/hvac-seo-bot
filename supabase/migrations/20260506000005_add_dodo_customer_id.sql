ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dodo_customer_id text;
CREATE INDEX IF NOT EXISTS profiles_dodo_customer_idx ON profiles (dodo_customer_id);
