import { z } from "zod"

export const MAX_COMPARED_PRODUCTS = 3

/** Series color per selection slot — follows the slot, never the rank. */
export const SLOT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
] as const

const slugSchema = z.string().regex(/^[a-z0-9-]{1,80}$/)

/**
 * `?products=slug-a,slug-b` from URL search params: well-formed, deduplicated
 * slugs in order. Unknown slugs are dropped later against the catalog, so a
 * few extra candidates are kept before the final cap is applied.
 */
export const compareSlugsSchema = z
  .string()
  .max(1000)
  .optional()
  .catch(undefined)
  .transform((value) => {
    const slugs = (value ?? "")
      .split(",")
      .map((slug) => slug.trim().toLowerCase())
      .filter((slug) => slugSchema.safeParse(slug).success)
    return [...new Set(slugs)].slice(0, MAX_COMPARED_PRODUCTS * 4)
  })

export function parseCompareSlugs(
  params: Record<string, string | string[] | undefined>
): string[] {
  const value = Array.isArray(params.products)
    ? params.products.join(",")
    : params.products
  return compareSlugsSchema.parse(value)
}

/** Compare URL for a selection; slugs are validated, so no encoding needed. */
export function compareHref(slugs: readonly string[]) {
  return slugs.length ? `/compare?products=${slugs.join(",")}` : "/compare"
}
