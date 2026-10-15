-- Local/CI seed data. Runs on `supabase db reset`; never pushed to the remote project.

insert into public.brands (name, slug) values
  ('Nike', 'nike'),
  ('Adidas', 'adidas'),
  ('New Balance', 'new-balance'),
  ('Asics', 'asics'),
  ('Louis Vuitton', 'louis-vuitton'),
  ('Hermès', 'hermes'),
  ('Rolex', 'rolex');

insert into public.categories (name, slug) values
  ('Sneakers', 'sneakers'),
  ('Bags', 'bags'),
  ('Watches', 'watches');

insert into public.products (name, slug, brand_id, category_id, color, material, retail_price, release_date, external_id)
select p.name, p.slug, b.id, c.id, p.color, p.material, p.retail_price, p.release_date::date, p.slug
from (values
  ('Air Jordan 1 Retro High OG Chicago', 'aj1-chicago', 'nike', 'sneakers', 'Red', 'Leather', 180, '2022-11-19'),
  ('Nike Dunk Low Panda', 'dunk-low-panda', 'nike', 'sneakers', 'Black', 'Leather', 110, '2021-03-10'),
  ('Nike Air Max 1 Patta Waves', 'am1-patta-waves', 'nike', 'sneakers', 'Brown', 'Suede', 160, '2021-11-05'),
  ('Adidas Samba OG White', 'samba-og-white', 'adidas', 'sneakers', 'White', 'Leather', 100, '2023-01-15'),
  ('Adidas Gazelle Indoor Blue', 'gazelle-indoor-blue', 'adidas', 'sneakers', 'Blue', 'Suede', 120, '2023-09-01'),
  ('Yeezy Boost 350 V2 Bone', 'yeezy-350-bone', 'adidas', 'sneakers', 'Beige', 'Knit', 230, '2022-03-04'),
  ('New Balance 550 White Green', 'nb-550-white-green', 'new-balance', 'sneakers', 'Green', 'Leather', 110, '2021-06-01'),
  ('New Balance 2002R Protection Pack', 'nb-2002r-protection', 'new-balance', 'sneakers', 'Grey', 'Suede', 150, '2021-08-20'),
  ('New Balance 990v6 Grey', 'nb-990v6-grey', 'new-balance', 'sneakers', 'Grey', 'Mesh', 200, '2023-04-20'),
  ('Asics Gel-Kayano 14 Cream', 'kayano-14-cream', 'asics', 'sneakers', 'Beige', 'Mesh', 150, '2023-02-10'),
  ('Asics Gel-1130 Silver', 'gel-1130-silver', 'asics', 'sneakers', 'Silver', 'Mesh', 110, '2023-07-12'),
  ('Louis Vuitton Speedy 25', 'lv-speedy-25', 'louis-vuitton', 'bags', 'Brown', 'Canvas', 1650, '2019-01-01'),
  ('Louis Vuitton Neverfull MM', 'lv-neverfull-mm', 'louis-vuitton', 'bags', 'Brown', 'Canvas', 2030, '2019-01-01'),
  ('Hermès Birkin 30 Togo', 'hermes-birkin-30', 'hermes', 'bags', 'Black', 'Leather', 11400, '2018-01-01'),
  ('Hermès Kelly 28 Epsom', 'hermes-kelly-28', 'hermes', 'bags', 'Beige', 'Leather', 10900, '2018-01-01'),
  ('Rolex Submariner Date 126610LN', 'rolex-sub-126610ln', 'rolex', 'watches', 'Black', 'Steel', 10250, '2020-09-01'),
  ('Rolex Daytona 126500LN', 'rolex-daytona-126500ln', 'rolex', 'watches', 'White', 'Steel', 15100, '2023-03-29'),
  ('Rolex GMT-Master II Pepsi', 'rolex-gmt-pepsi', 'rolex', 'watches', 'Blue', 'Steel', 10900, '2018-03-20')
) as p(name, slug, brand_slug, category_slug, color, material, retail_price, release_date)
join public.brands b on b.slug = p.brand_slug
join public.categories c on c.slug = p.category_slug;

-- 365 days of deterministic price history per product: resale premium + drift + seasonality + noise
insert into public.price_history (product_id, price, recorded_on, source)
select
  p.id,
  round((
    p.retail_price
    * (1.15 + (abs(hashtext(p.slug)) % 80) / 100.0)
    * (1 + ((abs(hashtext(p.slug || 'drift')) % 41) - 20) / 100.0 * d / 365.0)
    * (1 + 0.04 * sin(d / 18.0 + (abs(hashtext(p.slug)) % 7)))
    * (1 + ((abs(hashtext(p.slug || d::text)) % 100) - 50) / 2500.0)
  )::numeric, 2),
  current_date - (365 - d),
  'api'
from public.products p
cross join generate_series(0, 365) as d;

-- 26 weeks of trend scores
insert into public.trend_snapshots (dimension, value, score, period_date)
select
  t.dimension::public.trend_dimension,
  t.value,
  round(greatest(0, least(100,
    t.base + t.slope * w + 4 * sin(w / 3.0 + length(t.value))
  ))::numeric, 2),
  date_trunc('week', current_date)::date - (25 - w) * 7
from (values
  ('color', 'Beige', 52, 1.2),
  ('color', 'Brown', 48, 1.0),
  ('color', 'Silver', 35, 1.5),
  ('color', 'Black', 70, -0.3),
  ('color', 'White', 66, -0.5),
  ('color', 'Red', 44, -0.8),
  ('material', 'Suede', 50, 1.1),
  ('material', 'Mesh', 45, 0.9),
  ('material', 'Leather', 72, -0.2),
  ('material', 'Knit', 58, -1.0),
  ('category', 'Sneakers', 62, 0.2),
  ('category', 'Bags', 55, 0.7),
  ('category', 'Watches', 50, 0.4)
) as t(dimension, value, base, slope)
cross join generate_series(0, 25) as w;

insert into public.sources (title, url, type) values
  ('Resale market mid-year report', 'https://example.com/reports/resale-midyear', 'report'),
  ('Earth tones dominate fall drops', 'https://example.com/articles/earth-tones', 'article'),
  ('Instagram: retro runner sightings', 'https://example.com/social/retro-runners', 'social');

insert into public.observations (product_id, note, tags, observed_at)
select p.id, o.note, o.tags, now() - o.age
from (values
  ('kayano-14-cream', 'Sold out in under 10 minutes at three EU retailers; resale premium widening.', array['sell-out', 'retro-runner'], interval '3 days'),
  ('samba-og-white', 'Restock volume increased; premium cooling compared to last quarter.', array['restock'], interval '8 days'),
  ('dunk-low-panda', 'Heavy general release supply keeps prices near retail.', array['oversupply'], interval '12 days'),
  ('hermes-birkin-30', 'Auction results in Hong Kong 18% above estimate.', array['auction'], interval '5 days')
) as o(slug, note, tags, age)
join public.products p on p.slug = o.slug;

insert into public.observation_sources (observation_id, source_id)
select o.id, s.id
from public.observations o
join public.products p on p.id = o.product_id
join public.sources s on s.type = case when p.slug = 'hermes-birkin-30' then 'report'::public.source_type else 'social'::public.source_type end;

insert into public.articles (title, slug, excerpt, body, status, published_at) values
  ('The Retro Runner Takeover', 'retro-runner-takeover',
   'Why mesh runners from the 2000s are outpacing classic court shoes.',
   'Retro running silhouettes such as the Gel-Kayano 14 and 1130 have moved from niche to mainstream...',
   'published', now() - interval '6 days'),
  ('Earth Tones Are the New Neutral', 'earth-tones-new-neutral',
   'Beige and brown colorways keep climbing across sneakers and bags.',
   'Our color index shows beige up for the sixth consecutive month...',
   'published', now() - interval '2 days'),
  ('Q4 Watch Market Outlook', 'q4-watch-outlook',
   'Draft analysis of secondary pricing for steel sports watches.',
   '',
   'draft', null);

insert into public.article_products (article_id, product_id)
select a.id, p.id
from public.articles a
join public.products p on
  (a.slug = 'retro-runner-takeover' and p.slug in ('kayano-14-cream', 'gel-1130-silver', 'nb-2002r-protection'))
  or (a.slug = 'earth-tones-new-neutral' and p.slug in ('yeezy-350-bone', 'hermes-kelly-28', 'lv-speedy-25'));

insert into public.sync_logs (started_at, finished_at, status, records_updated)
values (now() - interval '1 hour', now() - interval '58 minutes', 'success', 18 * 366);
