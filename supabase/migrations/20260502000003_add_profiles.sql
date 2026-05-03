-- Phase 2.1 prerequisite: user profiles with role, onboarding state, and display name.
-- Also auto-creates a profile row for every new Supabase auth signup via trigger.

CREATE TABLE IF NOT EXISTS profiles (
  id                  uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             uuid        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name           text,
  avatar_url          text,
  role                text        NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  onboarding_complete bool        NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read and update only their own profile.
CREATE POLICY "profiles: own read"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "profiles: own update"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    -- Prevent self-promotion to admin via client-side update
    role = (SELECT role FROM profiles WHERE user_id = auth.uid())
  );

-- Admins can read all profiles (needed for Phase 8 user lookup).
CREATE POLICY "profiles: admin read all"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
        AND p.role = 'admin'
    )
  );

-- Auto-create a profile row whenever a new user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop first so re-running the migration is safe.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
