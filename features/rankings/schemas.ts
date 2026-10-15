import { z } from "zod"

export const RANKING_TYPES = {
  gainers: {
    label: "Top gainers",
    shortLabel: "Gainers",
    description: "Biggest resale price increases over the period.",
  },
  losers: {
    label: "Top losers",
    shortLabel: "Losers",
    description: "Biggest resale price drops over the period.",
  },
  premium: {
    label: "Highest premium",
    shortLabel: "Premium",
    description: "Trading furthest above retail price right now.",
  },
  value: {
    label: "Below retail",
    shortLabel: "Below retail",
    description: "Value buys — currently trading under retail price.",
  },
} as const

export type RankingType = keyof typeof RANKING_TYPES

export const RANKING_PERIODS = {
  "7d": "7 days",
  "30d": "30 days",
  "1y": "1 year",
} as const

export type RankingPeriod = keyof typeof RANKING_PERIODS

/** Gainers and losers move over a period; premium rankings are a snapshot. */
export function isPeriodRanking(type: RankingType) {
  return type === "gainers" || type === "losers"
}

const enumKeys = <T extends Record<string, unknown>>(record: T) =>
  Object.keys(record) as [keyof T & string, ...(keyof T & string)[]]

/** Rankings view state from URL search params. Invalid values fall back to defaults. */
export const rankingFiltersSchema = z.object({
  type: z.enum(enumKeys(RANKING_TYPES)).catch("gainers"),
  period: z.enum(enumKeys(RANKING_PERIODS)).catch("30d"),
  category: z
    .string()
    .regex(/^[a-z0-9-]{1,40}$/)
    .optional()
    .catch(undefined),
})

export type RankingFilters = z.infer<typeof rankingFiltersSchema>

export function parseRankingFilters(
  params: Record<string, string | string[] | undefined>
): RankingFilters {
  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value
  return rankingFiltersSchema.parse({
    type: first(params.type),
    period: first(params.period),
    category: first(params.category),
  })
}
