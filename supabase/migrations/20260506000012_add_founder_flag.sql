ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_founder boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS profiles_founder_idx ON profiles (is_founder) WHERE is_founder = true;

-- When a new auth user signs up, check if their email is on the founding-member
-- waitlist. If so, mark their profile as a founder. Runs as part of the existing
-- auto-create profile trigger flow.
CREATE OR REPLACE FUNCTION public.mark_founder_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- NEW.user_id is the row that was just inserted into profiles.
  -- Look up the auth user's email and cross-check the waitlist.
  PERFORM 1
  FROM auth.users u
  JOIN public.waitlist w ON lower(w.email) = lower(u.email)
  WHERE u.id = NEW.user_id
    AND w.is_founding = true;

  IF FOUND THEN
    NEW.is_founder = true;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_mark_founder ON public.profiles;
CREATE TRIGGER profiles_mark_founder
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.mark_founder_on_signup();
