import "server-only"

import { escapeLike } from "@/lib/supabase/escape-like"
import { createClient } from "@/lib/supabase/server"
import {
  OBSERVATIONS_PAGE_SIZE,
  type ObservationFilters,
} from "@/features/observations/schemas"
import type {
  ObservationListPage,
  ObservationProductOption,
} from "@/features/observations/types"

/** PostgREST error for a page past the end of the result set. */
const RANGE_NOT_SATISFIABLE = "PGRST103"

/** PostgREST caps responses at 1,000 rows. */
const MAX_ROWS = 1000

/** One page of observations, newest first, with product and linked sources. */
export async function listObservations(
  filters: ObservationFilters
): Promise<ObservationListPage> {
  const supabase = await createClient()
  const from = (filters.page - 1) * OBSERVATIONS_PAGE_SIZE

  let query = supabase
    .from("observations")
    .select(
      "id, note, tags, observed_at, products!inner(id, name, slug, color, brands(name)), observation_sources(source_id)",
      { count: "exact" }
    )
  if (filters.q) query = query.ilike("note", `%${escapeLike(filters.q)}%`)
  if (filters.product) query = query.eq("products.slug", filters.product)
  if (filters.tag) query = query.contains("tags", [filters.tag])

  const { data, count, error } = await query
    .order("observed_at", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id")
    .range(from, from + OBSERVATIONS_PAGE_SIZE - 1)

  if (error?.code === RANGE_NOT_SATISFIABLE && filters.page > 1) {
    return listObservations({ ...filters, page: 1 })
  }
  if (error) throw error

  const total = count ?? 0
  return {
    items: data.map(
      ({ products: { brands, ...product }, observation_sources, ...row }) => ({
        ...row,
        product: { ...product, brand: brands.name },
        sourceIds: observation_sources.map((link) => link.source_id),
      })
    ),
    total,
    page: filters.page,
    pageCount: Math.max(1, Math.ceil(total / OBSERVATIONS_PAGE_SIZE)),
  }
}

/** Products for the form's picker and the list filter, by category then name. */
export async function listObservationProductOptions(): Promise<
  ObservationProductOption[]
> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, color, brands(name), categories(name)")
    .order("name")
    .limit(MAX_ROWS)
  if (error) throw error

  return data
    .map(({ brands, categories, ...product }) => ({
      ...product,
      brand: brands.name,
      category: categories.name,
    }))
    .sort((a, b) => a.category.localeCompare(b.category))
}

/**
 * Distinct tags for the list filter. Read from the most recent observations
 * (bounded by the PostgREST row cap), which covers every tag in active use.
 */
export async function listObservationTags(): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("observations")
    .select("tags")
    .order("observed_at", { ascending: false })
    .limit(MAX_ROWS)
  if (error) throw error
  return [...new Set(data.flatMap((row) => row.tags))].sort()
}
