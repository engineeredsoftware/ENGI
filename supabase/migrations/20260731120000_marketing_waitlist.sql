-- Marketing landing waitlist (priority access / launch notes).
-- Service-role inserts only; no public read of emails.
-- Roles are multi-select: seller / buyer / builder (no "both" enum).

create table if not exists public.marketing_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  roles text[] not null
    check (
      cardinality(roles) > 0
      and roles <@ array['seller', 'buyer', 'builder']::text[]
    ),
  source text not null default 'landing',
  created_at timestamptz not null default now(),
  constraint marketing_waitlist_email_unique unique (email)
);

create index if not exists marketing_waitlist_created_at_idx
  on public.marketing_waitlist (created_at desc);

alter table public.marketing_waitlist enable row level security;

-- No policies for authenticated/anon: only service role (supabaseAdmin) writes.
comment on table public.marketing_waitlist is
  'Landing waitlist emails for Bitcode priority access; multi-select roles; service-role write only.';
