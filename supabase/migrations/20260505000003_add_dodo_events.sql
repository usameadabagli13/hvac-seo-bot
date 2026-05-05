-- Idempotency table for Dodo Payments webhook events
create table if not exists dodo_events (
  id           uuid        primary key default gen_random_uuid(),
  event_id     text        unique not null,
  event_type   text        not null,
  processed_at timestamptz not null default now()
);

alter table dodo_events enable row level security;

-- Service role only — no client access
create policy "service role only" on dodo_events
  for all using (false);
