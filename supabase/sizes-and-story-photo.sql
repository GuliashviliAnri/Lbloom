-- LBLOOM: plant sizes with separate prices + a second photo inside garden stories.
-- Safe to run more than once; nothing is deleted.
alter table public.products add column if not exists variants jsonb not null default '[]'::jsonb;
alter table public.products drop constraint if exists products_variants_check;
alter table public.products add constraint products_variants_check
 check(jsonb_typeof(variants)='array' and jsonb_array_length(variants)<=12);
alter table public.garden_stories add column if not exists body_image_url text not null default '';
notify pgrst, 'reload schema';
