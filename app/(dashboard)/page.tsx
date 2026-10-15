import type { Metadata } from "next"
import { ChartLineIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { PageHeader } from "@/components/shared/page-header"
import { DashboardStats } from "@/features/dashboard/components/dashboard-stats"
import {
  LatestArticles,
  LatestObservations,
} from "@/features/dashboard/components/latest-research"
import { MarketIndexChart } from "@/features/dashboard/components/market-index-chart"
import { MoverList } from "@/features/dashboard/components/mover-list"
import { TrendHighlightsCard } from "@/features/dashboard/components/trend-highlights"
import {
  getCategoryIndexSeries,
  getDashboardSummary,
  getTrendHighlights,
  listLatestArticles,
  listLatestObservations,
  listTopMovers,
} from "@/features/dashboard/queries"

export const metadata: Metadata = {
  title: { absolute: "TrendScope" },
}

export default async function DashboardPage() {
  const [summary, movers, indexSeries, trends, articles, observations] =
    await Promise.all([
      getDashboardSummary(),
      listTopMovers(),
      getCategoryIndexSeries(),
      getTrendHighlights(),
      listLatestArticles(),
      listLatestObservations(),
    ])

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Market overview, top movers and the latest research."
      />

      <DashboardStats summary={summary} topGainer={movers.gainers[0]} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Market index by category</CardTitle>
            <CardDescription>
              Average resale price as % of retail · 100 = trading at retail
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            {indexSeries.points.length > 1 ? (
              <MarketIndexChart {...indexSeries} />
            ) : (
              <Empty className="h-72">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ChartLineIcon />
                  </EmptyMedia>
                  <EmptyTitle>No index history yet</EmptyTitle>
                  <EmptyDescription>
                    The index fills in as daily prices are synced.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
        </Card>
        <TrendHighlightsCard {...trends} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MoverList
          title="Top gainers"
          description="Biggest 30-day price increases"
          href="/products?sort=change_30d_pct&dir=desc"
          movers={movers.gainers}
          emptyIcon={TrendingUpIcon}
          emptyTitle="No gainers this month"
        />
        <MoverList
          title="Top losers"
          description="Biggest 30-day price drops"
          href="/products?sort=change_30d_pct&dir=asc"
          movers={movers.losers}
          emptyIcon={TrendingDownIcon}
          emptyTitle="No losers this month"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LatestArticles articles={articles} />
        <LatestObservations observations={observations} />
      </div>
    </>
  )
}
