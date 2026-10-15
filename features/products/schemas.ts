import { z } from "zod"

export const PRODUCT_SORTS = {
  name: "Name",
  price: "Price",
  change_7d_pct: "7d change",
  change_30d_pct: "30d change",
  change_1y_pct: "1y change",
  premium_pct: "Premium",
} as const

export type ProductSort = keyof typeof PRODUCT_SORTS

const optionalText = z
  .string()
  .trim()
  .max(80)
  .optional()
  .transform((value) => value || undefined)

/** Product list filters from URL search params. Invalid values fall back to defaults. */
export const productFiltersSchema = z.object({
  q: optionalText.catch(undefined),
  category: optionalText.catch(undefined),
  brand: optionalText.catch(undefined),
  color: optionalText.catch(undefined),
  material: optionalText.catch(undefined),
  sort: z
    .enum(Object.keys(PRODUCT_SORTS) as [ProductSort, ...ProductSort[]])
    .catch("change_30d_pct"),
  dir: z.enum(["asc", "desc"]).catch("desc"),
})

export type ProductFilters = z.infer<typeof productFiltersSchema>

export function parseProductFilters(
  params: Record<string, string | string[] | undefined>
): ProductFilters {
  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value
  return productFiltersSchema.parse({
    q: first(params.q),
    category: first(params.category),
    brand: first(params.brand),
    color: first(params.color),
    material: first(params.material),
    sort: first(params.sort),
    dir: first(params.dir),
  })
}
