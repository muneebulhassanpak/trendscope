import type { ProductOverview } from "@/features/products/types"

/** A product in a leaderboard, with the metric it is ranked by. */
export type RankedProduct = ProductOverview & { rank: number; metric: number }

export type RankingCategory = { value: string; label: string }
