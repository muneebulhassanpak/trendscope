import type { Metadata } from "next"
import { TrophyIcon } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { PageHeader } from "@/components/shared/page-header"
import { RankingControls } from "@/features/rankings/components/ranking-controls"
import { RankingList } from "@/features/rankings/components/ranking-list"
import {
  listRankingCategories,
  listRankings,
} from "@/features/rankings/queries"
import {
  isPeriodRanking,
  parseRankingFilters,
  RANKING_PERIODS,
  RANKING_TYPES,
} from "@/features/rankings/schemas"

export const metadata: Metadata = { title: "Rankings" }

export default async function RankingsPage({
  searchParams,
}: PageProps<"/rankings">) {
  const filters = parseRankingFilters(await searchParams)
  const [products, categories] = await Promise.all([
    listRankings(filters),
    listRankingCategories(),
  ])

  const ranking = RANKING_TYPES[filters.type]
  const category = categories.find((c) => c.value === filters.category)
  const scope = [
    category?.label ?? "All categories",
    isPeriodRanking(filters.type) ? RANKING_PERIODS[filters.period] : null,
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <>
      <PageHeader
        title="Rankings"
        description="Leaderboards of the market's biggest movers and premiums."
      />
      <RankingControls filters={filters} categories={categories}>
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
          <div className="flex flex-col gap-0.5">
            <h2 className="font-medium">{ranking.label}</h2>
            <p className="text-sm text-muted-foreground">
              {ranking.description}
            </p>
          </div>
          <p
            className="text-xs font-medium text-muted-foreground"
            aria-live="polite"
          >
            {scope}
          </p>
        </div>
        {products.length ? (
          <RankingList
            products={products}
            showRetail={!isPeriodRanking(filters.type)}
          />
        ) : (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <TrophyIcon />
              </EmptyMedia>
              <EmptyTitle>No products qualify</EmptyTitle>
              <EmptyDescription>
                Nothing in {category?.label ?? "the catalog"} matches this
                ranking right now. Try another category
                {isPeriodRanking(filters.type) ? " or period" : ""}.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </RankingControls>
    </>
  )
}
