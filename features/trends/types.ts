import type { Enums, Tables } from "@/lib/supabase/database.types"

export type TrendDimension = Enums<"trend_dimension">

export type TrendSnapshot = Pick<
  Tables<"trend_snapshots">,
  "value" | "score" | "period_date"
>

/** One attribute value's weekly score history, aligned to `TrendOverview.periods`. */
export type TrendSeries = {
  value: string
  /** Products list filtered to this value. */
  href: string
  /** Score per period (null when the value has no snapshot that week). */
  scores: (number | null)[]
  latest: number | null
  /** Score points gained or lost versus four weeks earlier (not a percentage). */
  change: number | null
}

export type TrendOverview = {
  dimension: TrendDimension
  /** Week start dates (YYYY-MM-DD), oldest first. */
  periods: string[]
  /** Sorted by value name so every entity keeps a stable position. */
  series: TrendSeries[]
}
