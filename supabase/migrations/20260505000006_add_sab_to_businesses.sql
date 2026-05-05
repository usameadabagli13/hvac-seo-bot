ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS is_service_area_business boolean NOT NULL DEFAULT false;
