-- Execute in Supabase SQL Editor. No service role key is needed by the website.
begin;
create table if not exists public.admins(user_id uuid primary key references auth.users(id) on delete cascade,created_at timestamptz not null default now());
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon,authenticated;
create or replace function private.is_admin() returns boolean language sql stable security definer set search_path = '' as $$ select exists(select 1 from public.admins where user_id=(select auth.uid())); $$;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated;
create table if not exists public.categories(id uuid primary key default gen_random_uuid(),name text not null,slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),sort_order integer not null default 0,group_slug text not null default 'other' check(group_slug in ('conifers','trees-shrubs','flowering','fruit','grasses','other')));
create table if not exists public.products(id uuid primary key default gen_random_uuid(),name text not null,slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),category_id uuid not null references public.categories(id) on delete restrict,price numeric(12,2) check(price >= 0),height text not null default '',description text not null default '',image_url text not null default '',gallery_images text[] not null default '{}',is_in_stock boolean not null default false,is_featured boolean not null default false,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.furniture(id uuid primary key default gen_random_uuid(),name text not null,category_slug text check(category_slug in ('chairs','tables','swings','bodzkinti')),slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),price numeric(12,2) check(price >= 0),description text not null default '',dimensions_or_set_details text not null default '',image_url text not null default '',gallery_images text[] not null default '{}',is_in_stock boolean not null default false,is_featured boolean not null default false,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.services(id uuid primary key default gen_random_uuid(),title text not null,slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),description text not null default '',image_url text not null default '',sort_order integer not null default 0);
create table if not exists public.videos(id uuid primary key default gen_random_uuid(),title text not null,video_url text not null,thumbnail_url text not null,duration text not null,sort_order integer not null default 0);
create table if not exists public.site_settings(id smallint primary key default 1 check(id=1),phone text not null,address text not null default '',google_maps_url text not null default '',google_maps_embed_url text not null default '',working_hours text not null,facebook_url text not null default '',instagram_url text not null default '',whatsapp_url text not null default '',messenger_url text not null default '');

-- Preserve rows and add fields introduced by later versions.
alter table public.categories add column if not exists group_slug text not null default 'other' check(group_slug in ('conifers','trees-shrubs','flowering','fruit','grasses','other'));
alter table public.furniture add column if not exists category_slug text check(category_slug in ('chairs','tables','swings','bodzkinti'));
alter table public.site_settings add column if not exists google_maps_embed_url text not null default '';
create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_featured_idx on public.products(is_featured);
create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now();return new;end; $$;
drop trigger if exists products_updated on public.products;
create trigger products_updated before update on public.products for each row execute function public.touch_updated_at();
drop trigger if exists furniture_updated on public.furniture;
create trigger furniture_updated before update on public.furniture for each row execute function public.touch_updated_at();
alter table public.admins enable row level security;
drop policy if exists "admin can read own membership" on public.admins;
create policy "admin can read own membership" on public.admins for select to authenticated using(user_id=(select auth.uid()));
-- No client may add, update, or remove admins. Provision via SQL Editor only.
alter table public.categories enable row level security;
drop policy if exists "public read" on public.categories;
create policy "public read" on public.categories for select to anon,authenticated using(true);
drop policy if exists "admin insert" on public.categories;
create policy "admin insert" on public.categories for insert to authenticated with check((select private.is_admin()));
drop policy if exists "admin update" on public.categories;
create policy "admin update" on public.categories for update to authenticated using((select private.is_admin())) with check((select private.is_admin()));
drop policy if exists "admin delete" on public.categories;
create policy "admin delete" on public.categories for delete to authenticated using((select private.is_admin()));
grant select on public.categories to anon,authenticated;
grant insert,update,delete on public.categories to authenticated;

alter table public.products enable row level security;
drop policy if exists "public read" on public.products;
create policy "public read" on public.products for select to anon,authenticated using(true);
drop policy if exists "admin insert" on public.products;
create policy "admin insert" on public.products for insert to authenticated with check((select private.is_admin()));
drop policy if exists "admin update" on public.products;
create policy "admin update" on public.products for update to authenticated using((select private.is_admin())) with check((select private.is_admin()));
drop policy if exists "admin delete" on public.products;
create policy "admin delete" on public.products for delete to authenticated using((select private.is_admin()));
grant select on public.products to anon,authenticated;
grant insert,update,delete on public.products to authenticated;

alter table public.furniture enable row level security;
drop policy if exists "public read" on public.furniture;
create policy "public read" on public.furniture for select to anon,authenticated using(true);
drop policy if exists "admin insert" on public.furniture;
create policy "admin insert" on public.furniture for insert to authenticated with check((select private.is_admin()));
drop policy if exists "admin update" on public.furniture;
create policy "admin update" on public.furniture for update to authenticated using((select private.is_admin())) with check((select private.is_admin()));
drop policy if exists "admin delete" on public.furniture;
create policy "admin delete" on public.furniture for delete to authenticated using((select private.is_admin()));
grant select on public.furniture to anon,authenticated;
grant insert,update,delete on public.furniture to authenticated;

alter table public.services enable row level security;
drop policy if exists "public read" on public.services;
create policy "public read" on public.services for select to anon,authenticated using(true);
drop policy if exists "admin insert" on public.services;
create policy "admin insert" on public.services for insert to authenticated with check((select private.is_admin()));
drop policy if exists "admin update" on public.services;
create policy "admin update" on public.services for update to authenticated using((select private.is_admin())) with check((select private.is_admin()));
drop policy if exists "admin delete" on public.services;
create policy "admin delete" on public.services for delete to authenticated using((select private.is_admin()));
grant select on public.services to anon,authenticated;
grant insert,update,delete on public.services to authenticated;

alter table public.videos enable row level security;
drop policy if exists "public read" on public.videos;
create policy "public read" on public.videos for select to anon,authenticated using(true);
drop policy if exists "admin insert" on public.videos;
create policy "admin insert" on public.videos for insert to authenticated with check((select private.is_admin()));
drop policy if exists "admin update" on public.videos;
create policy "admin update" on public.videos for update to authenticated using((select private.is_admin())) with check((select private.is_admin()));
drop policy if exists "admin delete" on public.videos;
create policy "admin delete" on public.videos for delete to authenticated using((select private.is_admin()));
grant select on public.videos to anon,authenticated;
grant insert,update,delete on public.videos to authenticated;

alter table public.site_settings enable row level security;
drop policy if exists "public read" on public.site_settings;
create policy "public read" on public.site_settings for select to anon,authenticated using(true);
drop policy if exists "admin insert" on public.site_settings;
create policy "admin insert" on public.site_settings for insert to authenticated with check((select private.is_admin()));
drop policy if exists "admin update" on public.site_settings;
create policy "admin update" on public.site_settings for update to authenticated using((select private.is_admin())) with check((select private.is_admin()));
drop policy if exists "admin delete" on public.site_settings;
create policy "admin delete" on public.site_settings for delete to authenticated using((select private.is_admin()));
grant select on public.site_settings to anon,authenticated;
grant insert,update,delete on public.site_settings to authenticated;
grant select on public.admins to authenticated;
revoke insert,update,delete on public.admins from anon,authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('product-images','product-images',true,8388608,array['image/jpeg','image/png','image/webp']),('video-thumbnails','video-thumbnails',true,8388608,array['image/jpeg','image/png','image/webp']) on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "public catalog images" on storage.objects;
create policy "public catalog images" on storage.objects for select to anon,authenticated using(bucket_id in ('product-images','video-thumbnails'));
drop policy if exists "admin image upload" on storage.objects;
create policy "admin image upload" on storage.objects for insert to authenticated with check(bucket_id in ('product-images','video-thumbnails') and (select private.is_admin()));
drop policy if exists "admin image update" on storage.objects;
create policy "admin image update" on storage.objects for update to authenticated using(bucket_id in ('product-images','video-thumbnails') and (select private.is_admin())) with check(bucket_id in ('product-images','video-thumbnails') and (select private.is_admin()));
drop policy if exists "admin image delete" on storage.objects;
create policy "admin image delete" on storage.objects for delete to authenticated using(bucket_id in ('product-images','video-thumbnails') and (select private.is_admin()));
insert into public.categories(name,slug,sort_order) values('ტუია','tuia',0),('სმარაგდი','smaragdi',1),('კიპაროსი','kiparosi',2),('ზეთისხილი','zetiskhili',3),('ოლეანდრა','oleandra',4),('ევონიმუსი','evonimusi',5),('წყავი','tsyavi',6),('სხვა მცენარეები','other',7) on conflict(slug) do nothing;
insert into public.site_settings(id,phone,address,working_hours,facebook_url,whatsapp_url,messenger_url) values(1,'574 240 286','მისამართის დასაზუსტებლად დაგვიკავშირდით','10:00–19:00','https://www.facebook.com/l.bloom.eliava','https://wa.me/995574240286','https://m.me/l.bloom.eliava') on conflict(id) do nothing;
update public.site_settings set google_maps_url='https://maps.app.goo.gl/NByamwrbVk9PRbhB9',google_maps_embed_url='https://maps.google.com/maps?q=41.7285178,44.7826003&z=17&output=embed' where id=1 and google_maps_url='' and google_maps_embed_url='';
create table if not exists public.garden_stories(
 id uuid primary key default gen_random_uuid(),
 title text not null,
 slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 excerpt text not null default '',
 body text not null default '',
 image_url text not null default '',
 is_published boolean not null default false,
 sort_order integer not null default 0,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.garden_stories enable row level security;
drop policy if exists "published garden stories" on public.garden_stories;
create policy "published garden stories" on public.garden_stories for select to anon,authenticated using(is_published or (select private.is_admin()));
drop policy if exists "admin insert garden stories" on public.garden_stories;
create policy "admin insert garden stories" on public.garden_stories for insert to authenticated with check((select private.is_admin()));
drop policy if exists "admin update garden stories" on public.garden_stories;
create policy "admin update garden stories" on public.garden_stories for update to authenticated using((select private.is_admin())) with check((select private.is_admin()));
drop policy if exists "admin delete garden stories" on public.garden_stories;
create policy "admin delete garden stories" on public.garden_stories for delete to authenticated using((select private.is_admin()));
grant select on public.garden_stories to anon,authenticated;
grant insert,update,delete on public.garden_stories to authenticated;
create index if not exists garden_stories_published_idx on public.garden_stories(is_published,sort_order);
drop trigger if exists garden_stories_updated on public.garden_stories;
create trigger garden_stories_updated before update on public.garden_stories for each row execute function public.touch_updated_at();
-- After creating an admin user in Supabase Auth:
-- insert into public.admins(user_id) values ('AUTH_USER_UUID') on conflict do nothing;

update public.categories set group_slug=case when slug in ('tuia','smaragdi','kiparosi') then 'conifers' when slug='zetiskhili' then 'fruit' when slug='oleandra' then 'flowering' when slug in ('evonimusi','tsyavi') then 'trees-shrubs' else 'other' end where group_slug='other';

-- Existing catalog rows and admin access are preserved.
alter table public.categories add column if not exists kind text not null default 'plant' check(kind in ('plant','furniture'));
insert into public.categories(name,slug,kind,group_slug,sort_order) values
 ('სკამები','chairs','furniture','other',0),
 ('მაგიდები','tables','furniture','other',1),
 ('საქანელები','swings','furniture','other',2),
 ('ბოძკინტები','bodzkinti','furniture','other',3)
on conflict(slug) do nothing;
-- Replace the old fixed list with a catalog reference, so new categories work.
alter table public.furniture drop constraint if exists furniture_category_slug_check;
alter table public.furniture drop constraint if exists furniture_category_slug_fkey;
alter table public.furniture add constraint furniture_category_slug_fkey foreign key(category_slug) references public.categories(slug) on update cascade on delete restrict;

update public.site_settings set instagram_url='https://www.instagram.com/lbloom.ge/' where id=1 and instagram_url='';
-- Run once in Supabase SQL Editor. Existing files and records are preserved.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('videos','videos',true,52428800,array['video/mp4','video/webm'])
on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "public video read" on storage.objects;
create policy "public video read" on storage.objects for select to anon,authenticated using(bucket_id='videos');
drop policy if exists "admin video upload" on storage.objects;
create policy "admin video upload" on storage.objects for insert to authenticated with check(bucket_id='videos' and exists(select 1 from public.admins where user_id=(select auth.uid())));
drop policy if exists "admin video update" on storage.objects;
create policy "admin video update" on storage.objects for update to authenticated using(bucket_id='videos' and exists(select 1 from public.admins where user_id=(select auth.uid()))) with check(bucket_id='videos' and exists(select 1 from public.admins where user_id=(select auth.uid())));
drop policy if exists "admin video delete" on storage.objects;
create policy "admin video delete" on storage.objects for delete to authenticated using(bucket_id='videos' and exists(select 1 from public.admins where user_id=(select auth.uid())));

alter table public.products add column if not exists sale_price numeric(12,2);
alter table public.furniture add column if not exists sale_price numeric(12,2);
alter table public.products drop constraint if exists products_sale_price_check;
alter table public.products add constraint products_sale_price_check check(sale_price is null or (price is not null and sale_price >= 0 and sale_price < price));
alter table public.furniture drop constraint if exists furniture_sale_price_check;
alter table public.furniture add constraint furniture_sale_price_check check(sale_price is null or (price is not null and sale_price >= 0 and sale_price < price));
notify pgrst, 'reload schema';

alter table public.videos add column if not exists created_at timestamptz not null default now();
alter table public.videos alter column created_at set default now();
notify pgrst, 'reload schema';

commit;

-- One-time setup. Public reads and admin-only writes keep their existing RLS policies.
alter table public.products add column if not exists sort_order integer not null default 0;
alter table public.furniture add column if not exists sort_order integer not null default 0;
alter table public.products alter column sort_order set default 0;
alter table public.furniture alter column sort_order set default 0;
alter table public.services alter column sort_order set default 0;
alter table public.videos alter column sort_order set default 0;
alter table public.garden_stories alter column sort_order set default 0;
create index if not exists products_display_order_idx on public.products(sort_order,created_at desc,id desc);
create index if not exists furniture_display_order_idx on public.furniture(sort_order,created_at desc,id desc);
create index if not exists services_display_order_idx on public.services(sort_order,created_at desc,id desc);
create index if not exists videos_display_order_idx on public.videos(sort_order,created_at desc,id desc);
create index if not exists garden_stories_display_order_idx on public.garden_stories(sort_order,created_at desc,id desc);
create or replace function public.reorder_catalog_items(p_table text,p_ids uuid[])
returns void language plpgsql security invoker set search_path='' as $$
declare total bigint; matched bigint;
begin
 if not private.is_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
 if p_table not in ('products','furniture','services','videos','garden_stories') or p_table is null then raise exception 'Invalid section'; end if;
 if p_ids is null or cardinality(p_ids)>10000 or array_position(p_ids,null) is not null or (select count(distinct id) from unnest(p_ids) as id)<>cardinality(p_ids) then raise exception 'Invalid order'; end if;
 execute format('lock table public.%I in share row exclusive mode',p_table);
 execute format('select count(*),count(*) filter(where id=any($1)) from public.%I',p_table) into total,matched using p_ids;
 if total<>cardinality(p_ids) or matched<>total then raise exception 'Catalog changed; reload and try again' using errcode='40001'; end if;
 execute format('update public.%I as item set sort_order=ordered.position::integer from unnest($1::uuid[]) with ordinality as ordered(id,position) where item.id=ordered.id',p_table) using p_ids;
end;
$$;
revoke all on function public.reorder_catalog_items(text,uuid[]) from public,anon;
grant execute on function public.reorder_catalog_items(text,uuid[]) to authenticated;
