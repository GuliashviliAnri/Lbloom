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
