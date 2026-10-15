-- TrendScope initial schema
-- Core data, trend intelligence, editorial/admin, users & system.

create extension if not exists pg_trgm with schema extensions;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('admin', 'viewer');
create type public.trend_dimension as enum ('color', 'material', 'category');
create type public.source_type as enum ('article', 'report', 'social', 'other');
create type public.article_status as enum ('draft', 'published');
create type public.sync_status as enum ('running', 'success', 'failed');

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Users (profiles extend auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role public.user_role not null default 'viewer',
  created_at timestamptz not null default now()
);

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Core data
-- ---------------------------------------------------------------------------
create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  logo_url text,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  brand_id uuid not null references public.brands (id) on delete restrict,
  category_id uuid not null references public.categories (id) on delete restrict,
  color text,
  material text,
  retail_price numeric(10, 2),
  image_url text,
  external_id text unique,
  release_date date,
  search tsvector generated always as (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(color, '') || ' ' || coalesce(material, ''))
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_brand_id_idx on public.products (brand_id);
create index products_category_id_idx on public.products (category_id);
create index products_search_idx on public.products using gin (search);
create index products_name_trgm_idx on public.products using gin (name extensions.gin_trgm_ops);

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create table public.price_history (
  id bigint generated always as identity primary key,
  product_id uuid not null references public.products (id) on delete cascade,
  price numeric(10, 2) not null check (price >= 0),
  recorded_on date not null,
  source text not null default 'api',
  created_at timestamptz not null default now(),
  unique (product_id, recorded_on, source)
);

create index price_history_product_date_idx on public.price_history (product_id, recorded_on desc);

-- ---------------------------------------------------------------------------
-- Trend intelligence
-- ---------------------------------------------------------------------------
create table public.trend_snapshots (
  id bigint generated always as identity primary key,
  dimension public.trend_dimension not null,
  value text not null,
  score numeric(6, 2) not null,
  period_date date not null,
  created_at timestamptz not null default now(),
  unique (dimension, value, period_date)
);

create index trend_snapshots_dimension_period_idx on public.trend_snapshots (dimension, period_date desc);

-- ---------------------------------------------------------------------------
-- Editorial & admin
-- ---------------------------------------------------------------------------
create table public.sources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  type public.source_type not null default 'other',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.observations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  note text not null,
  tags text[] not null default '{}',
  observed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index observations_product_id_idx on public.observations (product_id);

create trigger observations_set_updated_at
  before update on public.observations
  for each row execute function public.set_updated_at();

create table public.observation_sources (
  observation_id uuid not null references public.observations (id) on delete cascade,
  source_id uuid not null references public.sources (id) on delete cascade,
  primary key (observation_id, source_id)
);

create index observation_sources_source_id_idx on public.observation_sources (source_id);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  body text not null default '',
  cover_url text,
  status public.article_status not null default 'draft',
  author_id uuid references public.profiles (id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status = 'draft' or published_at is not null)
);

create index articles_status_published_at_idx on public.articles (status, published_at desc);

create trigger articles_set_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

create table public.article_products (
  article_id uuid not null references public.articles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  primary key (article_id, product_id)
);

create index article_products_product_id_idx on public.article_products (product_id);

-- ---------------------------------------------------------------------------
-- System
-- ---------------------------------------------------------------------------
create table public.sync_logs (
  id bigint generated always as identity primary key,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status public.sync_status not null default 'running',
  records_updated integer not null default 0,
  error text
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Public catalogue is readable by everyone; writes are admin-only.
-- Server jobs (API sync) use the secret key, which bypasses RLS.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.brands enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.price_history enable row level security;
alter table public.trend_snapshots enable row level security;
alter table public.sources enable row level security;
alter table public.observations enable row level security;
alter table public.observation_sources enable row level security;
alter table public.articles enable row level security;
alter table public.article_products enable row level security;
alter table public.sync_logs enable row level security;

-- profiles
create policy "Users read own profile, admins read all" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy "Admins update profiles" on public.profiles
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- public read + admin write tables
do $$
declare
  t text;
begin
  foreach t in array array[
    'brands', 'categories', 'products', 'price_history', 'trend_snapshots',
    'sources', 'observations', 'observation_sources', 'article_products'
  ]
  loop
    execute format(
      'create policy "Public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format(
      'create policy "Admins insert" on public.%I for insert to authenticated with check ((select public.is_admin()))', t);
    execute format(
      'create policy "Admins update" on public.%I for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', t);
    execute format(
      'create policy "Admins delete" on public.%I for delete to authenticated using ((select public.is_admin()))', t);
  end loop;
end;
$$;

-- articles: public sees published only
create policy "Read published articles, admins read all" on public.articles
  for select to anon, authenticated
  using (status = 'published' or (select public.is_admin()));
create policy "Admins insert articles" on public.articles
  for insert to authenticated with check ((select public.is_admin()));
create policy "Admins update articles" on public.articles
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
create policy "Admins delete articles" on public.articles
  for delete to authenticated using ((select public.is_admin()));

-- sync_logs: admins read; writes come from server jobs
create policy "Admins read sync logs" on public.sync_logs
  for select to authenticated using ((select public.is_admin()));
