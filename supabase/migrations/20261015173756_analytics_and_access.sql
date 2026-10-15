-- Analytics views, trend computation and admin-area access for the demo role.

-- ---------------------------------------------------------------------------
-- Schema additions
-- ---------------------------------------------------------------------------
alter table public.products add column description text;

alter table public.sync_logs
  add column provider text not null default 'demo',
  add column trigger text not null default 'manual'
    check (trigger in ('manual', 'schedule', 'cli'));

create index sync_logs_started_at_idx on public.sync_logs (started_at desc);

-- ---------------------------------------------------------------------------
-- Access: admins and the demo role may view the admin area; only admins write.
-- ---------------------------------------------------------------------------
create function public.has_admin_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role in ('admin', 'demo')
  );
$$;

drop policy "Read published articles, admins read all" on public.articles;
create policy "Read published articles, admin area reads all" on public.articles
  for select to anon, authenticated
  using (status = 'published' or (select public.has_admin_access()));

drop policy "Admins read sync logs" on public.sync_logs;
create policy "Admin area reads sync logs" on public.sync_logs
  for select to authenticated using ((select public.has_admin_access()));

-- ---------------------------------------------------------------------------
-- Analytics views (security_invoker: callers' RLS applies)
-- ---------------------------------------------------------------------------
create view public.product_overview
with (security_invoker = true) as
select
  p.id,
  p.name,
  p.slug,
  p.description,
  p.color,
  p.material,
  p.retail_price,
  p.release_date,
  p.image_url,
  p.search,
  b.id as brand_id,
  b.name as brand_name,
  b.slug as brand_slug,
  c.id as category_id,
  c.name as category_name,
  c.slug as category_slug,
  latest.price as latest_price,
  latest.recorded_on as latest_recorded_on,
  round((latest.price / nullif(d7.price, 0) - 1) * 100, 2) as change_7d_pct,
  round((latest.price / nullif(d30.price, 0) - 1) * 100, 2) as change_30d_pct,
  round((latest.price / nullif(d365.price, 0) - 1) * 100, 2) as change_1y_pct,
  round((latest.price / nullif(p.retail_price, 0) - 1) * 100, 2) as premium_pct
from public.products p
join public.brands b on b.id = p.brand_id
join public.categories c on c.id = p.category_id
left join lateral (
  select ph.price, ph.recorded_on from public.price_history ph
  where ph.product_id = p.id
  order by ph.recorded_on desc limit 1
) latest on true
left join lateral (
  select ph.price from public.price_history ph
  where ph.product_id = p.id and ph.recorded_on >= latest.recorded_on - 7
  order by ph.recorded_on asc limit 1
) d7 on true
left join lateral (
  select ph.price from public.price_history ph
  where ph.product_id = p.id and ph.recorded_on >= latest.recorded_on - 30
  order by ph.recorded_on asc limit 1
) d30 on true
left join lateral (
  select ph.price from public.price_history ph
  where ph.product_id = p.id and ph.recorded_on >= latest.recorded_on - 365
  order by ph.recorded_on asc limit 1
) d365 on true;

-- Resale index: average price as % of retail (100 = trading at retail)
create view public.market_index_daily
with (security_invoker = true) as
select
  ph.recorded_on,
  round(avg(ph.price / p.retail_price) * 100, 2) as index_value,
  count(*)::integer as product_count
from public.price_history ph
join public.products p on p.id = ph.product_id
where p.retail_price > 0
group by ph.recorded_on;

create view public.category_index_daily
with (security_invoker = true) as
select
  ph.recorded_on,
  c.slug as category_slug,
  c.name as category_name,
  round(avg(ph.price / p.retail_price) * 100, 2) as index_value
from public.price_history ph
join public.products p on p.id = ph.product_id
join public.categories c on c.id = p.category_id
where p.retail_price > 0
group by ph.recorded_on, c.slug, c.name;

-- ---------------------------------------------------------------------------
-- Trend snapshots: weekly momentum score (0-100, 50 = flat) per color,
-- material and category, from 28-day price change of matching products.
-- Server-side only (called by the market data sync with the secret key).
-- ---------------------------------------------------------------------------
create function public.refresh_trend_snapshots(weeks integer default 26)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected integer;
begin
  with periods as (
    select date_trunc('week', current_date)::date - (n * 7) as period_date
    from generate_series(0, weeks - 1) as n
  ),
  product_change as (
    select
      pr.period_date,
      p.color,
      p.material,
      c.name as category,
      (cur.price / nullif(prev.price, 0) - 1) * 100 as change_pct
    from periods pr
    cross join public.products p
    join public.categories c on c.id = p.category_id
    join lateral (
      select ph.price from public.price_history ph
      where ph.product_id = p.id and ph.recorded_on <= pr.period_date + 6
      order by ph.recorded_on desc limit 1
    ) cur on true
    join lateral (
      select ph.price from public.price_history ph
      where ph.product_id = p.id and ph.recorded_on <= pr.period_date + 6 - 28
      order by ph.recorded_on desc limit 1
    ) prev on true
  ),
  scores as (
    select period_date, 'color'::public.trend_dimension as dimension, color as value, avg(change_pct) as avg_change
    from product_change where color is not null group by period_date, color
    union all
    select period_date, 'material'::public.trend_dimension, material, avg(change_pct)
    from product_change where material is not null group by period_date, material
    union all
    select period_date, 'category'::public.trend_dimension, category, avg(change_pct)
    from product_change group by period_date, category
  )
  insert into public.trend_snapshots (dimension, value, score, period_date)
  select dimension, value, round(greatest(0, least(100, 50 + avg_change * 2.5))::numeric, 2), period_date
  from scores
  on conflict (dimension, value, period_date) do update set score = excluded.score;

  get diagnostics affected = row_count;
  return affected;
end;
$$;

revoke execute on function public.refresh_trend_snapshots(integer) from public, anon, authenticated;
grant execute on function public.refresh_trend_snapshots(integer) to service_role;
