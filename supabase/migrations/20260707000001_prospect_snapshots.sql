-- Prospect snapshots: admin-created rank analyses for sales outreach.
-- Publicly readable via token; only writable via service role.

CREATE TABLE IF NOT EXISTS public.prospect_snapshots (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  token         text          UNIQUE NOT NULL,
  business_name text          NOT NULL,
  city          text          NOT NULL,
  keyword       text          NOT NULL,
  center_lat    numeric(10,7) NOT NULL,
  center_lng    numeric(10,7) NOT NULL,
  points        jsonb         NOT NULL,
  created_at    timestamptz   NOT NULL DEFAULT now()
);

ALTER TABLE public.prospect_snapshots ENABLE ROW LEVEL SECURITY;

-- Share links are public — anyone with the token can view
CREATE POLICY "prospect_snapshots_public_read"
  ON public.prospect_snapshots FOR SELECT USING (true);

-- No INSERT/UPDATE/DELETE policy → only service role key can write
