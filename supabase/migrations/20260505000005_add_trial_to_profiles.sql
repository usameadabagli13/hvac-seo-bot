-- Phase 6.2 — 14-day Pro trial for new signups.
-- New users land on Pro with a 14-day trial window. After trial expiry,
-- middleware/server logic downgrades them to 'starter' unless they paid.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;

-- Backfill: any existing user without a trial gets a 14-day trial from now,
-- and their plan is bumped to 'pro' so existing testers experience the trial.
UPDATE profiles
SET    trial_ends_at = now() + interval '14 days',
       plan          = 'pro'
WHERE  trial_ends_at IS NULL
  AND  plan = 'starter';

-- Replace the signup trigger so brand-new users start on a Pro trial.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, plan, trial_ends_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    'pro',
    now() + interval '14 days'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
