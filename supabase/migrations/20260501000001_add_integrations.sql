-- integrations: stores OAuth tokens for third-party connections (GBP, Yelp, etc.)
CREATE TABLE integrations (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider      text        NOT NULL,          -- e.g. 'google_business_profile'
  access_token  text        NOT NULL,
  refresh_token text,
  expires_at    timestamptz NOT NULL,
  scope         text,
  -- GBP-specific resolved resource names (populated post-OAuth)
  account_name  text,   -- e.g. "accounts/123456789"
  location_name text,   -- e.g. "accounts/123456789/locations/987654321"
  created_at    timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, provider)
);

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "integrations_select" ON integrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "integrations_insert" ON integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "integrations_update" ON integrations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "integrations_delete" ON integrations
  FOR DELETE USING (auth.uid() = user_id);
