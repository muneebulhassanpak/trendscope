import "server-only"

import { createClient } from "@/lib/supabase/server"
import { listRecentPrices } from "@/features/products/queries"
import { MAX_COMPARED_PRODUCTS } from "@/features/compare/schemas"
import type { CompareOption, Comparison } from "@/features/compare/types"

const HISTORY_DAYS = 365

/**
 * The picker catalog plus the selected products with a year of price history.
 * Only slugs that exist in the catalog are kept, capped at three.
 */
export async function getComparison(slugs: string[]): Promise<Comparison> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("product_overview")
    .select("*")
    .order("category_name")
    .order("name")
  if (error) throw error

  const catalog = data.flatMap((product) =>
    product.id && product.slug ? [{ ...product, slug: product.slug }] : []
  )
  const bySlug = new Map(catalog.map((product) => [product.slug, product]))
  const selected = slugs
    .flatMap((slug) => bySlug.get(slug) ?? [])
    .slice(0, MAX_COMPARED_PRODUCTS)

  const history = await listRecentPrices(
    selected.map((product) => product.id!),
    HISTORY_DAYS
  )

  return {
    options: catalog.map((product): CompareOption => ({
      slug: product.slug,
      name: product.name ?? product.slug,
      brand: product.brand_name ?? "",
      category: product.category_name ?? "Other",
    })),
    products: selected.map((product, slot) => ({
      ...product,
      slot,
      history: history.get(product.id!) ?? [],
    })),
  }
}
