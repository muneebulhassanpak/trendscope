import { z } from "zod"

import { Constants } from "@/lib/supabase/database.types"
import type { TrendDimension } from "@/features/trends/types"

export const TREND_DIMENSIONS = {
  color: { label: "Colors", singular: "color" },
  material: { label: "Materials", singular: "material" },
  category: { label: "Categories", singular: "category" },
} as const satisfies Record<TrendDimension, { label: string; singular: string }>

/** Trend page state from URL search params. Invalid values fall back to defaults. */
export const trendFiltersSchema = z.object({
  dimension: z
    .enum(Constants.public.Enums.trend_dimension)
    .catch("color" satisfies TrendDimension),
})

export type TrendFilters = z.infer<typeof trendFiltersSchema>

export function parseTrendFilters(
  params: Record<string, string | string[] | undefined>
): TrendFilters {
  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value
  return trendFiltersSchema.parse({ dimension: first(params.dimension) })
}
