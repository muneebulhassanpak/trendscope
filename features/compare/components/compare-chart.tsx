"use client"

import { useMemo, useState } from "react"
import {
  CartesianGrid,
  type LabelProps,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ChangeBadge } from "@/components/shared/change-badge"
import {
  formatDate,
  formatPercent,
  formatPrice,
  formatShortDate,
} from "@/lib/format"
import { SLOT_COLORS } from "@/features/compare/schemas"
import type { PricePoint } from "@/features/products/types"

const PERIODS = { "1M": 30, "3M": 90, "6M": 182, "1Y": 365 } as const
type Period = keyof typeof PERIODS

/** End labels closer than this share of the y-range would collide; the legend covers them. */
const LABEL_MIN_GAP = 0.08

export type CompareSeries = {
  slug: string
  name: string
  slot: number
  history: PricePoint[]
}

type Row = { date: string } & Record<string, number | string>

const seriesKey = (slot: number) => `s${slot}`
const priceKey = (slot: number) => `s${slot}Price`

/**
 * Price history of up to three products, each indexed to % change from the
 * first day of the period so products priced in hundreds and tens of
 * thousands share one honest y-axis.
 */
export function CompareChart({ series }: { series: CompareSeries[] }) {
  const [period, setPeriod] = useState<Period>("3M")

  const chartConfig = useMemo(
    () =>
      Object.fromEntries(
        series.map((item) => [
          seriesKey(item.slot),
          { label: item.name, color: SLOT_COLORS[item.slot] },
        ])
      ) satisfies ChartConfig,
    [series]
  )

  const { data, changes, labelled, ticks } = useMemo(() => {
    const rows = new Map<string, Row>()
    const changes = new Map<number, number | null>()

    for (const item of series) {
      const points = item.history.slice(-PERIODS[period] - 1)
      const base = points[0]?.price
      for (const point of points) {
        const row = rows.get(point.date) ?? { date: point.date }
        row[seriesKey(item.slot)] = base ? (point.price / base - 1) * 100 : 0
        row[priceKey(item.slot)] = point.price
        rows.set(point.date, row)
      }
      const last = points.at(-1)?.price
      changes.set(
        item.slot,
        base && last && points.length > 1 ? (last / base - 1) * 100 : null
      )
    }

    // Direct end labels only where they won't collide with another series'.
    const values = [...rows.values()].flatMap((row) =>
      series.map((item) => row[seriesKey(item.slot)] as number | undefined)
    )
    const finite = values.filter((v): v is number => v != null)
    const ticks = percentTicks(Math.min(...finite, 0), Math.max(...finite, 0))
    const range = ticks.at(-1)! - ticks[0]!
    const labelled = new Set(
      series
        .filter((item) => {
          const end = changes.get(item.slot)
          if (end == null) return false
          return series.every((other) => {
            const otherEnd = changes.get(other.slot)
            return (
              other.slot === item.slot ||
              otherEnd == null ||
              Math.abs(otherEnd - end) / range >= LABEL_MIN_GAP
            )
          })
        })
        .map((item) => item.slot)
    )

    return {
      data: [...rows.values()].sort((a, b) => a.date.localeCompare(b.date)),
      changes,
      labelled,
      ticks,
    }
  }, [series, period])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <ul
          aria-label="Legend"
          className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:gap-x-5"
        >
          {series.map((item) => (
            <li
              key={item.slug}
              className="flex min-w-0 items-center gap-2 text-sm"
            >
              <span
                aria-hidden
                className="h-0.5 w-4 shrink-0 rounded-full"
                style={{ background: SLOT_COLORS[item.slot] }}
              />
              <span className="truncate text-muted-foreground">
                {item.name}
              </span>
              <ChangeBadge value={changes.get(item.slot)} />
            </li>
          ))}
        </ul>
        <ToggleGroup
          variant="outline"
          size="sm"
          value={[period]}
          onValueChange={(value) => value[0] && setPeriod(value[0] as Period)}
          aria-label="Chart period"
          className="shrink-0"
        >
          {(Object.keys(PERIODS) as Period[]).map((key) => (
            <ToggleGroupItem key={key} value={key} aria-label={`Show ${key}`}>
              {key}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
        <LineChart data={data} margin={{ left: 4, right: 56, top: 8 }}>
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
            width={56}
            domain={[ticks[0]!, ticks.at(-1)!]}
            ticks={ticks}
            tickFormatter={(value: number) => formatPercent(value)}
          />
          <ReferenceLine
            y={0}
            stroke="var(--muted-foreground)"
            strokeOpacity={0.5}
          />
          <ChartTooltip
            cursor={{ stroke: "var(--border)" }}
            content={
              <ChartTooltipContent
                className="min-w-48"
                labelFormatter={(_, payload) =>
                  payload?.[0] ? formatDate(payload[0].payload.date) : null
                }
                formatter={(value, name, item) => {
                  const slot = Number(String(name).slice(1))
                  return (
                    <div className="flex w-full items-center gap-2">
                      <span
                        aria-hidden
                        className="size-2.5 shrink-0 rounded-[2px]"
                        style={{ background: item.color }}
                      />
                      <span className="max-w-36 truncate text-muted-foreground">
                        {chartConfig[String(name)]?.label}
                      </span>
                      <span className="ml-auto flex items-baseline gap-1.5 font-medium tabular-nums">
                        {formatPercent(Number(value))}
                        <span className="text-[0.7rem] font-normal text-muted-foreground">
                          {formatPrice(Number(item.payload?.[priceKey(slot)]))}
                        </span>
                      </span>
                    </div>
                  )
                }}
              />
            }
          />
          {series.map((item) => {
            const key = seriesKey(item.slot)
            return (
              <Line
                key={item.slug}
                dataKey={key}
                type="monotone"
                stroke={`var(--color-${key})`}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
                connectNulls
                isAnimationActive={false}
                label={
                  labelled.has(item.slot)
                    ? (props: EndLabelProps) => (
                        <EndLabel
                          key={`${key}-label`}
                          {...props}
                          last={data.length - 1}
                        />
                      )
                    : false
                }
              />
            )
          })}
        </LineChart>
      </ChartContainer>
    </div>
  )
}

/** Evenly spaced, round percentage ticks (1/2/2.5/5 × 10ⁿ) spanning min..max. */
function percentTicks(min: number, max: number, target = 4) {
  const raw = (max - min || 1) / target
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const step =
    [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) ??
    10 * magnitude
  const ticks: number[] = []
  for (
    let tick = Math.floor(min / step) * step;
    tick <= Math.ceil(max / step) * step + step / 2;
    tick += step
  ) {
    ticks.push(Math.round(tick * 1e6) / 1e6)
  }
  return ticks
}

type EndLabelProps = Pick<LabelProps, "index" | "x" | "y" | "value">

/** Value at the end of a line, in ink (never the series color). */
function EndLabel({
  index,
  x,
  y,
  value,
  last,
}: EndLabelProps & { last: number }) {
  if (index !== last || typeof value !== "number") return null
  return (
    <text
      x={Number(x) + 8}
      y={Number(y)}
      dominantBaseline="central"
      className="fill-foreground text-[11px] font-medium tabular-nums"
    >
      {formatPercent(value)}
    </text>
  )
}
