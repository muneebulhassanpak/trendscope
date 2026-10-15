import "server-only"

import { createClient } from "@/lib/supabase/server"
import type {
  RankingFilters,
  RankingPeriod,
  RankingType,
} from "@/features/rankings/schemas"
import type { RankedProduct, RankingCategory } from "@/features/rankings/types"

const RANKING_LIMIT = 10

const PERIOD_COLUMNS = {
  "7d": "change_7d_pct",
  "30d": "change_30d_pct",
  "1y": "change_1y_pct",
} as const satisfies Record<RankingPeriod, string>

/** The metric column a ranking sorts by, and which direction counts as "top". */
function rankingMetric(type: RankingType, period: RankingPeriod) {
  switch (type) {
    case "gainers":
      return { column: PERIOD_COLUMNS[period], direction: "up" } as const
    case "losers":
      return { column: PERIOD_COLUMNS[period], direction: "down" } as const
    case "premium":
      return { column: "premium_pct", direction: "up" } as const
    case "value":
      return { column: "premium_pct", direction: "down" } as const
  }
}

/**
 * Leaderboard from the `product_overview` view. Only products that actually
 * moved in the ranked direction qualify, so a list can legitimately be empty.
 */
export async function listRankings(
  filters: RankingFilters
): Promise<RankedProduct[]> {
  const { column, direction } = rankingMetric(filters.type, filters.period)
  const supabase = await createClient()

  let query = supabase.from("product_overview").select("*")
  if (filters.category) query = query.eq("category_slug", filters.category)
  query =
    direction === "up"
      ? query.gt(column, 0).order(column, { ascending: false })
      : query.lt(column, 0).order(column, { ascending: true })

  const { data, error } = await query.limit(RANKING_LIMIT)
  if (error) throw error

  return data.map((product, index) => ({
    ...product,
    rank: index + 1,
    metric: product[column] ?? 0,
  }))
}

export async function listRankingCategories(): Promise<RankingCategory[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("categories")
    .select("name, slug")
    .order("name")
  if (error) throw error
  return data.map((category) => ({
    value: category.slug,
    label: category.name,
  }))
}
