-- Add is_replied boolean to reviews.
-- Distinct from replied_at: is_replied = true when a reply is saved/drafted,
-- replied_at = non-null only when the reply is actually posted to the platform (Phase 3.4+).
ALTER TABLE reviews
  ADD COLUMN is_replied boolean NOT NULL DEFAULT false;
