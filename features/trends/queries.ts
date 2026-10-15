import "server-only"

import { createClient } from "@/lib/supabase/server"
import { CHANGE_WEEKS, TREND_WEEKS } from "@/features/trends/score"
import type {
  TrendDimension,
  TrendOverview,
  TrendSeries,
  TrendSnapshot,
} from "@/features/trends/types"

/** PostgREST caps responses at 1,000 rows. */
const MAX_ROWS = 1000

export async function listTrendSeries(
  dimension: TrendDimension
): Promise<TrendOverview> {
  const supabase = await createClient()

  const [snapshots, categorySlugs] = await Promise.all([
    supabase
      .from("trend_snapshots")
      .select("value, score, period_date")
      .eq("dimension", dimension)
      .order("period_date", { ascending: false })
      .order("value")
      .limit(MAX_ROWS),
    dimension === "category" ? listCategorySlugs() : null,
  ])
  if (snapshots.error) throw snapshots.error

  const rows = trimToWholeWeeks(snapshots.data)
  const periods = [...new Set(rows.map((row) => row.period_date))]
    .sort()
    .slice(-TREND_WEEKS)
  const periodIndex = new Map(periods.map((date, i) => [date, i]))

  const scoresByValue = new Map<string, (number | null)[]>()
  for (const row of rows) {
    const index = periodIndex.get(row.period_date)
    if (index === undefined) continue
    const scores =
      scoresByValue.get(row.value) ??
      Array<number | null>(periods.length).fill(null)
    scores[index] = row.score
    scoresByValue.set(row.value, scores)
  }

  const series = [...scoresByValue.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([value, scores]): TrendSeries => ({
      value,
      href: productsHref(dimension, value, categorySlugs),
      scores,
      latest: scores.at(-1) ?? null,
      change: scoreChange(scores),
    }))

  return { dimension, periods, series }
}

/**
 * Rows arrive newest first. If the response hit the row cap, the oldest week
 * may be partial — drop it rather than chart incomplete data.
 */
function trimToWholeWeeks(rows: TrendSnapshot[]) {
  if (rows.length < MAX_ROWS) return rows
  const oldest = rows.at(-1)!.period_date
  return rows.filter((row) => row.period_date !== oldest)
}

function scoreChange(scores: (number | null)[]) {
  const latest = scores.at(-1)
  const earlier = scores.at(-1 - CHANGE_WEEKS)
  return latest == null || earlier == null ? null : latest - earlier
}

/** Trend values store category names; the products filter expects slugs. */
async function listCategorySlugs() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("categories").select("name, slug")
  if (error) throw error
  return new Map(data.map((category) => [category.name, category.slug]))
}

function productsHref(
  dimension: TrendDimension,
  value: string,
  categorySlugs: Map<string, string> | null
) {
  const params = new URLSearchParams(
    dimension === "category"
      ? { category: categorySlugs?.get(value) ?? value.toLowerCase() }
      : { [dimension]: value }
  )
  return `/products?${params}`
}
