import type { Tables } from "@/lib/supabase/database.types"
import type { ProductListItem } from "@/features/products/types"

export type DashboardSummary = {
  productCount: number
  categoryCount: number
  /** Latest market index: average resale price as % of retail (100 = retail). */
  marketIndex: number | null
  /** Percent change of the market index over the last 30 days. */
  marketIndexChange30d: number | null
  observationsLast7d: number
}

export type Mover = ProductListItem

export type IndexCategory = Pick<Tables<"categories">, "name" | "slug">

/** One row per day; each category slug maps to that day's index value. */
export type CategoryIndexPoint = {
  date: string
  [slug: string]: number | string
}

export type CategoryIndexSeries = {
  /** Fixed entity order — drives series colors (`--chart-1`, `--chart-2`, …). */
  categories: IndexCategory[]
  points: CategoryIndexPoint[]
}

export type TrendSignal = Pick<
  Tables<"trend_snapshots">,
  "id" | "dimension" | "value" | "score"
>

export type TrendHighlights = {
  periodDate: string | null
  rising: TrendSignal[]
  cooling: TrendSignal[]
}

export type LatestArticle = Pick<
  Tables<"articles">,
  "id" | "title" | "slug" | "excerpt" | "published_at"
>

export type LatestObservation = Pick<
  Tables<"observations">,
  "id" | "note" | "tags" | "observed_at"
> & {
  product: Pick<Tables<"products">, "name" | "slug">
}
