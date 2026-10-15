-- Sync error messages can contain provider/internal details. The demo role
-- may read sync history but not error text; admins read it via a function.

revoke select on public.sync_logs from anon, authenticated;
grant select (id, started_at, finished_at, status, records_updated, provider, trigger)
  on public.sync_logs to authenticated;

create function public.get_sync_log_errors(log_ids bigint[])
returns table (id bigint, error text)
language sql
stable
security definer
set search_path = ''
as $$
  select l.id, l.error
  from public.sync_logs l
  where l.id = any (log_ids)
    and l.error is not null
    and (select public.is_admin());
$$;

revoke execute on function public.get_sync_log_errors(bigint[]) from public, anon;
grant execute on function public.get_sync_log_errors(bigint[]) to authenticated;
