import "server-only"

import { addDays, todayUtc } from "@/lib/market-data/dates"
import { createClient } from "@/lib/supabase/server"
import { listRecentPrices } from "@/features/products/queries"
import type {
  CategoryIndexPoint,
  CategoryIndexSeries,
  DashboardSummary,
  IndexCategory,
  LatestArticle,
  LatestObservation,
  Mover,
  TrendHighlights,
} from "@/features/dashboard/types"

const MOVERS_LIMIT = 5
const SPARKLINE_DAYS = 30
const TRENDS_LIMIT = 4
/** 1Y plus a little slack so the longest chart period is always full. */
const INDEX_DAYS = 366
/** Known categories keep a stable color slot; new ones follow alphabetically. */
const CATEGORY_ORDER = ["sneakers", "bags", "watches"]

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const supabase = await createClient()
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString()

  const [products, categories, index, observations] = await Promise.all([
    supabase
      .from("product_overview")
      .select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    // ~45 days covers the 30-day lookback even if a few sync days are missing.
    supabase
      .from("market_index_daily")
      .select("recorded_on, index_value")
      .order("recorded_on", { ascending: false })
      .limit(45),
    supabase
      .from("observations")
      .select("id", { count: "exact", head: true })
      .gte("observed_at", weekAgo),
  ])
  for (const result of [products, categories, index, observations]) {
    if (result.error) throw result.error
  }

  const rows = (index.data ?? []).filter(
    (row): row is { recorded_on: string; index_value: number } =>
      row.recorded_on != null && row.index_value != null
  )
  const latest = rows[0]
  const base = latest
    ? rows.find((row) => row.recorded_on <= addDays(latest.recorded_on, -30))
    : undefined

  return {
    productCount: products.count ?? 0,
    categoryCount: categories.count ?? 0,
    marketIndex: latest?.index_value ?? null,
    marketIndexChange30d:
      latest && base ? (latest.index_value / base.index_value - 1) * 100 : null,
    observationsLast7d: observations.count ?? 0,
  }
}

/** Biggest 30-day gainers and losers, each with a 30-day sparkline. */
export async function listTopMovers(): Promise<{
  gainers: Mover[]
  losers: Mover[]
}> {
  const supabase = await createClient()
  const [gainers, losers] = await Promise.all([
    supabase
      .from("product_overview")
      .select("*")
      .gt("change_30d_pct", 0)
      .order("change_30d_pct", { ascending: false })
      .limit(MOVERS_LIMIT),
    supabase
      .from("product_overview")
      .select("*")
      .lt("change_30d_pct", 0)
      .order("change_30d_pct", { ascending: true })
      .limit(MOVERS_LIMIT),
  ])
  if (gainers.error) throw gainers.error
  if (losers.error) throw losers.error

  const sparklines = await listRecentPrices(
    [...gainers.data, ...losers.data].map((product) => product.id!),
    SPARKLINE_DAYS
  )
  const withSparkline = (products: typeof gainers.data): Mover[] =>
    products.map((product) => ({
      ...product,
      sparkline: sparklines.get(product.id!) ?? [],
    }))

  return {
    gainers: withSparkline(gainers.data),
    losers: withSparkline(losers.data),
  }
}

/**
 * Daily resale index per category for the last year, pivoted to one row per day.
 * Fetched per category: all categories together exceed PostgREST's 1,000-row cap.
 */
export async function getCategoryIndexSeries(): Promise<CategoryIndexSeries> {
  const supabase = await createClient()
  const { data: categoryRows, error } = await supabase
    .from("categories")
    .select("name, slug")
  if (error) throw error

  const categories = sortCategories(categoryRows)
  const since = addDays(todayUtc(), -INDEX_DAYS)

  const results = await Promise.all(
    categories.map((category) =>
      supabase
        .from("category_index_daily")
        .select("recorded_on, index_value")
        .eq("category_slug", category.slug)
        .gte("recorded_on", since)
        .order("recorded_on", { ascending: true })
        .limit(INDEX_DAYS + 1)
    )
  )

  const byDate = new Map<string, CategoryIndexPoint>()
  results.forEach(({ data, error }, i) => {
    if (error) throw error
    const slug = categories[i]!.slug
    for (const row of data) {
      if (row.recorded_on == null || row.index_value == null) continue
      const point = byDate.get(row.recorded_on) ?? { date: row.recorded_on }
      point[slug] = row.index_value
      byDate.set(row.recorded_on, point)
    }
  })

  const points = [...byDate.values()].sort((a, b) =>
    a.date.localeCompare(b.date)
  )
  const plotted = categories.filter((category) =>
    points.some((point) => category.slug in point)
  )
  return { categories: plotted, points }
}

function sortCategories(categories: IndexCategory[]) {
  const rank = (slug: string) => {
    const index = CATEGORY_ORDER.indexOf(slug)
    return index === -1 ? CATEGORY_ORDER.length : index
  }
  return [...categories].sort(
    (a, b) => rank(a.slug) - rank(b.slug) || a.name.localeCompare(b.name)
  )
}

/** Strongest and weakest momentum attributes from the latest weekly snapshot. */
export async function getTrendHighlights(): Promise<TrendHighlights> {
  const supabase = await createClient()
  const { data: latest, error: latestError } = await supabase
    .from("trend_snapshots")
    .select("period_date")
    .order("period_date", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (latestError) throw latestError
  if (!latest) return { periodDate: null, rising: [], cooling: [] }

  const { data, error } = await supabase
    .from("trend_snapshots")
    .select("id, dimension, value, score")
    .eq("period_date", latest.period_date)
    .order("score", { ascending: false })
  if (error) throw error

  return {
    periodDate: latest.period_date,
    rising: data.filter((row) => row.score > 50).slice(0, TRENDS_LIMIT),
    cooling: data
      .filter((row) => row.score < 50)
      .reverse()
      .slice(0, TRENDS_LIMIT),
  }
}

export async function listLatestArticles(limit = 3): Promise<LatestArticle[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("articles")
    .select("id, title, slug, excerpt, published_at")
    .eq("status", "published")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function listLatestObservations(
  limit = 4
): Promise<LatestObservation[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("observations")
    .select("id, note, tags, observed_at, products!inner(name, slug)")
    .order("observed_at", { ascending: false })
    .limit(limit)
  if (error) throw error
  return data.map(({ products, ...observation }) => ({
    ...observation,
    product: products,
  }))
}
