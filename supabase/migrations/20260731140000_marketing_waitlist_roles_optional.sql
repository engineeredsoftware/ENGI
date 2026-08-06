-- Waitlist roles are optional: email alone is enough to join.
-- Allow empty roles[]; still restrict values when present.

alter table public.marketing_waitlist
  drop constraint if exists marketing_waitlist_roles_check;

alter table public.marketing_waitlist
  add constraint marketing_waitlist_roles_check
  check (roles <@ array['seller', 'buyer', 'builder']::text[]);

comment on table public.marketing_waitlist is
  'Landing waitlist emails for Bitcode priority access; optional multi-select roles; service-role write only.';
