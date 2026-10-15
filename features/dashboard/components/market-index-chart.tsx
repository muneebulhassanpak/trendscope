"use client"

import { useMemo, useState } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useIsMobile } from "@/hooks/use-mobile"
import { formatDate, formatNumber, formatShortDate } from "@/lib/format"
import type {
  CategoryIndexPoint,
  CategoryIndexSeries,
} from "@/features/dashboard/types"

const PERIODS = { "3M": 90, "6M": 182, "1Y": 365 } as const
type Period = keyof typeof PERIODS

/** The validated categorical palette has 8 slots; series beyond that are not plotted. */
const MAX_SERIES = 8
const LABEL_FONT_SIZE = 11
/** Minimum plot height in px, used to keep end labels from overlapping. */
const PLOT_HEIGHT = 240

export function MarketIndexChart({ categories, points }: CategoryIndexSeries) {
  const [period, setPeriod] = useState<Period>("6M")
  const isMobile = useIsMobile()

  const series = useMemo(() => categories.slice(0, MAX_SERIES), [categories])
  const config: ChartConfig = Object.fromEntries(
    series.map((category, i) => [
      category.slug,
      { label: category.name, color: `var(--chart-${i + 1})` },
    ])
  )

  const data = useMemo(
    () => points.slice(-PERIODS[period] - 1),
    [points, period]
  )
  const yTicks = useMemo(() => niceTicks(data, series), [data, series])
  const labeled = useMemo(
    () => (isMobile ? new Set<string>() : visibleEndLabels(data, series)),
    [data, series, isMobile]
  )

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ul
          aria-label="Legend"
          className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground"
        >
          {series.map((category) => (
            <li key={category.slug} className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="h-0.5 w-3 rounded-full"
                style={{ backgroundColor: config[category.slug]?.color }}
              />
              {category.name}
            </li>
          ))}
        </ul>
        <ToggleGroup
          variant="outline"
          size="sm"
          value={[period]}
          onValueChange={(value) => value[0] && setPeriod(value[0] as Period)}
          aria-label="Chart period"
        >
          {(Object.keys(PERIODS) as Period[]).map((key) => (
            <ToggleGroupItem key={key} value={key} aria-label={`Show ${key}`}>
              {key}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <ChartContainer
        config={config}
        className="aspect-auto min-h-72 w-full flex-1"
      >
        <LineChart
          data={data}
          margin={{ left: 4, right: isMobile ? 8 : 72, top: 8 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={40}
            tickFormatter={(value: string) => formatShortDate(value)}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={40}
            domain={[yTicks[0]!, yTicks.at(-1)!]}
            ticks={yTicks}
            tickFormatter={(value: number) => formatNumber(value)}
          />
          <ChartTooltip
            cursor={{ stroke: "var(--border)" }}
            content={
              <ChartTooltipContent
                indicator="line"
                labelFormatter={(_, payload) =>
                  payload?.[0] ? formatDate(payload[0].payload.date) : null
                }
                formatter={(value, name, item) => (
                  <div className="flex w-full items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span
                        className="h-0.5 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {config[String(name)]?.label ?? name}
                    </span>
                    <span className="font-medium text-foreground tabular-nums">
                      {formatNumber(Math.round(Number(value)))}
                    </span>
                  </div>
                )}
              />
            }
          />
          {series.map((category) => (
            <Line
              key={category.slug}
              dataKey={category.slug}
              name={category.slug}
              type="monotone"
              stroke={`var(--color-${category.slug})`}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
              isAnimationActive={false}
              label={
                labeled.has(category.slug)
                  ? ({ x, y, index }) =>
                      index === data.length - 1 ? (
                        <text
                          x={Number(x) + 8}
                          y={Number(y)}
                          dominantBaseline="middle"
                          fontSize={LABEL_FONT_SIZE}
                          className="fill-muted-foreground"
                        >
                          {category.name}
                        </text>
                      ) : null
                  : undefined
              }
            />
          ))}
        </LineChart>
      </ChartContainer>
    </div>
  )
}

function seriesValues(data: CategoryIndexPoint[], series: { slug: string }[]) {
  return data.flatMap((point) =>
    series
      .map((s) => point[s.slug])
      .filter((value): value is number => typeof value === "number")
  )
}

/** Round y-axis ticks (steps of 1, 2, 2.5 or 5 × 10ⁿ) spanning the visible data. */
function niceTicks(data: CategoryIndexPoint[], series: { slug: string }[]) {
  const values = seriesValues(data, series)
  if (!values.length) return [0, 100]
  const min = Math.min(...values)
  const max = Math.max(...values)
  const rough = (max - min || 1) / 4
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const step =
    [1, 2, 2.5, 5, 10].find((m) => m * magnitude >= rough)! * magnitude
  const ticks: number[] = []
  for (
    let tick = Math.floor(min / step) * step;
    tick < max + step;
    tick += step
  ) {
    ticks.push(tick)
    if (tick >= max) break
  }
  return ticks
}

/**
 * Direct end labels for series that end far enough apart to read. When two
 * lines converge, the lower one drops its label and relies on the legend.
 */
function visibleEndLabels(
  data: CategoryIndexPoint[],
  series: { slug: string }[]
) {
  const visible = new Set<string>()
  const last = data.at(-1)
  if (!last) return visible

  const values = seriesValues(data, series)
  const range = Math.max(...values) - Math.min(...values) || 1
  const minGap = (range * (LABEL_FONT_SIZE + 3)) / PLOT_HEIGHT

  const ends = series
    .map((s) => ({ slug: s.slug, value: last[s.slug] }))
    .filter(
      (end): end is { slug: string; value: number } =>
        typeof end.value === "number"
    )
    .sort((a, b) => b.value - a.value)

  let previous = Infinity
  for (const end of ends) {
    if (previous - end.value >= minGap) {
      visible.add(end.slug)
      previous = end.value
    }
  }
  return visible
}
