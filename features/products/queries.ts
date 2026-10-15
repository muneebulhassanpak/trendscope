import "server-only"

import { cache } from "react"

import { addDays, todayUtc } from "@/lib/market-data/dates"
import { createClient } from "@/lib/supabase/server"
import type { ProductFilters } from "@/features/products/schemas"
import type {
  PricePoint,
  ProductFilterOptions,
  ProductListItem,
  ProductOverview,
} from "@/features/products/types"

const SPARKLINE_DAYS = 30

export async function listProducts(
  filters: ProductFilters
): Promise<ProductListItem[]> {
  const supabase = await createClient()

  let query = supabase.from("product_overview").select("*")
  if (filters.q) {
    query = query.textSearch("search", filters.q, {
      type: "websearch",
      config: "english",
    })
  }
  if (filters.category) query = query.eq("category_slug", filters.category)
  if (filters.brand) query = query.eq("brand_slug", filters.brand)
  if (filters.color) query = query.eq("color", filters.color)
  if (filters.material) query = query.eq("material", filters.material)

  const column = filters.sort === "price" ? "latest_price" : filters.sort
  query = query.order(column, {
    ascending: filters.dir === "asc",
    nullsFirst: false,
  })

  const { data, error } = await query
  if (error) throw error

  const sparklines = await listRecentPrices(
    data.map((product) => product.id!),
    SPARKLINE_DAYS
  )
  return data.map((product) => ({
    ...product,
    sparkline: sparklines.get(product.id!) ?? [],
  }))
}

/** Distinct filter values from the catalog. Cached per request. */
export const listProductFilterOptions = cache(
  async (): Promise<ProductFilterOptions> => {
    const supabase = await createClient()
    const [{ data: products, error }, { data: categories }, { data: brands }] =
      await Promise.all([
        supabase.from("products").select("color, material"),
        supabase.from("categories").select("name, slug").order("name"),
        supabase.from("brands").select("name, slug").order("name"),
      ])
    if (error) throw error

    const distinct = (values: (string | null)[]) =>
      [...new Set(values.filter((v): v is string => Boolean(v)))]
        .sort()
        .map((value) => ({ value, label: value }))

    return {
      categories: (categories ?? []).map((c) => ({
        value: c.slug,
        label: c.name,
      })),
      brands: (brands ?? []).map((b) => ({ value: b.slug, label: b.name })),
      colors: distinct(products.map((p) => p.color)),
      materials: distinct(products.map((p) => p.material)),
    }
  }
)

export const getProductBySlug = cache(
  async (slug: string): Promise<ProductOverview | null> => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("product_overview")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()
    if (error) throw error
    return data
  }
)

export async function getPriceHistory(
  productId: string,
  days = 365
): Promise<PricePoint[]> {
  const prices = await listRecentPrices([productId], days)
  return prices.get(productId) ?? []
}

export async function listProductObservations(productId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("observations")
    .select("id, note, tags, observed_at, sources(id, title, url, type)")
    .eq("product_id", productId)
    .order("observed_at", { ascending: false })
  if (error) throw error
  return data
}

export async function listProductArticles(productId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("article_products")
    .select("articles!inner(id, title, slug, excerpt, published_at, status)")
    .eq("product_id", productId)
    .eq("articles.status", "published")
  if (error) throw error
  return data
    .map((row) => row.articles)
    .sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""))
}

/** PostgREST caps responses at 1,000 rows; batch products to stay under it. */
const MAX_ROWS_PER_REQUEST = 1000

export async function listRecentPrices(productIds: string[], days: number) {
  const byProduct = new Map<string, PricePoint[]>()
  if (!productIds.length) return byProduct

  const supabase = await createClient()
  const since = addDays(todayUtc(), -days)
  const perBatch = Math.max(1, Math.floor(MAX_ROWS_PER_REQUEST / (days + 1)))

  const batches: string[][] = []
  for (let i = 0; i < productIds.length; i += perBatch) {
    batches.push(productIds.slice(i, i + perBatch))
  }

  const results = await Promise.all(
    batches.map((ids) =>
      supabase
        .from("price_history")
        .select("product_id, price, recorded_on")
        .in("product_id", ids)
        .gte("recorded_on", since)
        .order("recorded_on", { ascending: true })
        .limit(ids.length * (days + 1))
    )
  )

  for (const { data, error } of results) {
    if (error) throw error
    for (const row of data) {
      const points = byProduct.get(row.product_id) ?? []
      points.push({ date: row.recorded_on, price: row.price })
      byProduct.set(row.product_id, points)
    }
  }
  return byProduct
}
