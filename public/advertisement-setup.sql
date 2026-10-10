-- LBLOOM — სარეკლამო ბანერის მართვა.
-- ერთხელ გაუშვით მთლიანად Supabase > SQL Editor-ში.
-- ხელახლა გაშვება არ შეცვლის არსებულ ბანერს ან სხვა კონტენტს.
begin;
create table if not exists public.advertisements (
 id smallint primary key default 1 check (id=1),
 title text not null default 'რეკლამის ადგილი',
 image_url text not null default '',
 link_url text not null default '',
 is_active boolean not null default true
);
alter table public.advertisements enable row level security;
drop policy if exists "public read advertisement" on public.advertisements;
create policy "public read advertisement" on public.advertisements for select to anon,authenticated using (true);
drop policy if exists "admin insert advertisement" on public.advertisements;
create policy "admin insert advertisement" on public.advertisements for insert to authenticated with check ((select private.is_admin()));
drop policy if exists "admin update advertisement" on public.advertisements;
create policy "admin update advertisement" on public.advertisements for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
grant select on public.advertisements to anon,authenticated;
grant insert,update on public.advertisements to authenticated;
revoke insert,update,delete on public.advertisements from anon;
insert into public.advertisements(id) values(1) on conflict(id) do nothing;
notify pgrst, 'reload schema';
commit;
