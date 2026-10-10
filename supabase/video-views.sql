-- Public read-only totals. Browser identifiers stay in the private schema.
create table if not exists public.video_view_counts (
 video_id uuid primary key references public.videos(id) on delete cascade,
 view_count bigint not null default 0 check (view_count >= 0)
);
alter table public.video_view_counts enable row level security;
revoke all on public.video_view_counts from anon, authenticated;
grant select on public.video_view_counts to anon, authenticated;
drop policy if exists "Public video view totals" on public.video_view_counts;
create policy "Public video view totals" on public.video_view_counts for select to anon, authenticated using (true);
create table if not exists private.video_view_visitors (
 video_id uuid not null references public.videos(id) on delete cascade,
 visitor_id uuid not null,
 primary key (video_id, visitor_id)
);
alter table private.video_view_visitors enable row level security;
revoke all on private.video_view_visitors from public, anon, authenticated;
-- Intentional anonymous analytics endpoint: only an existing video and a unique
-- browser token may add one view. No client can set a total or read visitor tokens.
create or replace function private.record_video_view(p_video_id uuid, p_visitor_id uuid)
returns bigint language plpgsql security definer set search_path = '' as $$
declare added integer; total bigint;
begin
 if p_video_id is null or p_visitor_id is null or not exists(select 1 from public.videos where id=p_video_id) then return null; end if;
 insert into private.video_view_visitors(video_id,visitor_id) values(p_video_id,p_visitor_id) on conflict do nothing;
 get diagnostics added = row_count;
 if added=1 then
  insert into public.video_view_counts as counts(video_id,view_count) values(p_video_id,1)
  on conflict(video_id) do update set view_count=counts.view_count+1 returning view_count into total;
 else
  select view_count into total from public.video_view_counts where video_id=p_video_id;
 end if;
 return coalesce(total,0);
end; $$;
revoke all on function private.record_video_view(uuid,uuid) from public;
grant execute on function private.record_video_view(uuid,uuid) to anon, authenticated;
create or replace function public.record_video_view(p_video_id uuid, p_visitor_id uuid)
returns bigint language sql security invoker set search_path = '' as $$
 select private.record_video_view(p_video_id,p_visitor_id);
$$;
revoke all on function public.record_video_view(uuid,uuid) from public;
grant execute on function public.record_video_view(uuid,uuid) to anon, authenticated;
notify pgrst, 'reload schema';
