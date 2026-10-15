import type { Metadata } from "next"
import { ChartLineIcon } from "lucide-react"

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
import { formatDate } from "@/lib/format"
import { DimensionNav } from "@/features/trends/components/dimension-nav"
import { ScoreExplainer } from "@/features/trends/components/score-explainer"
import { TrendHeatmap } from "@/features/trends/components/trend-heatmap"
import { TrendMovers } from "@/features/trends/components/trend-movers"
import { TrendScoreChart } from "@/features/trends/components/trend-score-chart"
import { listTrendSeries } from "@/features/trends/queries"
import { TREND_DIMENSIONS, parseTrendFilters } from "@/features/trends/schemas"

export const metadata: Metadata = { title: "Trends" }

export default async function TrendsPage({
  searchParams,
}: PageProps<"/trends">) {
  const { dimension } = parseTrendFilters(await searchParams)
  const { periods, series } = await listTrendSeries(dimension)
  const { label, singular } = TREND_DIMENSIONS[dimension]
  const noun = label.toLowerCase()
  const latestPeriod = periods.at(-1)

  return (
    <>
      <PageHeader
        title="Trends"
        description="Which colors, materials and categories are gaining or losing price momentum."
        actions={<DimensionNav active={dimension} />}
      />
      <ScoreExplainer />

      {series.length && latestPeriod ? (
        <>
          <TrendMovers series={series} noun={noun} />

          <Card>
            <CardHeader>
              <CardTitle>Score over time</CardTitle>
              <CardDescription>
                Weekly trend score by {singular} · last {periods.length} weeks ·
                dashed line marks flat (50)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TrendScoreChart
                key={dimension}
                periods={periods}
                series={series}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly heatmap</CardTitle>
              <CardDescription>
                Every {singular}, week by week, through the week of{" "}
                {formatDate(latestPeriod)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TrendHeatmap
                key={dimension}
                periods={periods}
                series={series}
                noun={noun}
              />
            </CardContent>
          </Card>
        </>
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ChartLineIcon />
            </EmptyMedia>
            <EmptyTitle>No trend data yet</EmptyTitle>
            <EmptyDescription>
              Trend scores are computed weekly by the market data sync. Check
              back after the next run.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </>
  )
}
