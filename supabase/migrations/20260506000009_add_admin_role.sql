-- Role column for /admin gate. Nullable so existing rows are unaffected.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text;

-- Optional: a CHECK so we don't accidentally accept arbitrary strings.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'profiles' AND constraint_name = 'profiles_role_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
      CHECK (role IS NULL OR role IN ('admin'));
  END IF;
END $$;
