-- Existing service creation dates were not recorded; future inserts use their actual time.
alter table public.services add column if not exists created_at timestamptz not null default now();
notify pgrst, 'reload schema';
