"use client"

import { useMemo, useState } from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
  type LabelProps,
} from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Toggle } from "@/components/ui/toggle"
import { useIsMobile } from "@/hooks/use-mobile"
import { formatDate, formatScore, formatShortDate } from "@/lib/format"
import { SCORE_FLAT } from "@/features/trends/score"
import type { TrendSeries } from "@/features/trends/types"

/** The validated categorical palette has eight slots; a ninth line never gets a generated hue. */
const MAX_LINES = 8

// Fixed geometry so direct labels can be placed in pixel space.
const CHART_HEIGHT = 320
const MARGIN_TOP = 12
const X_AXIS_HEIGHT = 28
const PLOT_HEIGHT = CHART_HEIGHT - MARGIN_TOP - X_AXIS_HEIGHT
const LABEL_GAP_PX = 14
const LABEL_GUTTER_PX = 84

type Slots = Map<string, number>

/**
 * Top lines by latest score are visible by default; each keeps its color slot
 * (assigned in name order, never by rank) until it is hidden.
 */
function initialSlots(series: TrendSeries[]): Slots {
  const top = new Set(
    series
      .filter((s) => s.latest != null)
      .sort((a, b) => b.latest! - a.latest!)
      .slice(0, MAX_LINES)
      .map((s) => s.value)
  )
  return new Map(
    series.filter((s) => top.has(s.value)).map((s, slot) => [s.value, slot])
  )
}

const dataKey = (index: number) => `v${index}`
const slotColor = (slot: number) => `var(--chart-${slot + 1})`

export function TrendScoreChart({
  periods,
  series,
}: {
  periods: string[]
  /** Sorted by value name (stable entity order). */
  series: TrendSeries[]
}) {
  const isMobile = useIsMobile()
  const [slots, setSlots] = useState(() => initialSlots(series))
  const full = slots.size >= MAX_LINES

  function toggle(value: string) {
    setSlots((current) => {
      const next = new Map(current)
      if (next.has(value)) {
        next.delete(value)
      } else if (next.size < MAX_LINES) {
        const used = new Set(next.values())
        next.set(
          value,
          [...Array(MAX_LINES).keys()].find((s) => !used.has(s))!
        )
      }
      return next
    })
  }

  const data = useMemo(
    () =>
      periods.map((date, i) => ({
        date,
        ...Object.fromEntries(series.map((s, k) => [dataKey(k), s.scores[i]])),
      })),
    [periods, series]
  )

  const visible = series
    .map((s, index) => ({ ...s, index, slot: slots.get(s.value) }))
    .filter((s): s is typeof s & { slot: number } => s.slot !== undefined)

  const config = Object.fromEntries(
    visible.map((s) => [
      dataKey(s.index),
      { label: s.value, color: slotColor(s.slot) },
    ])
  ) satisfies ChartConfig

  const labelOffsets = endLabelOffsets(visible)
  const showLabels = !isMobile && visible.length > 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div
          role="group"
          aria-label="Lines shown"
          className="flex flex-wrap gap-1.5"
        >
          {series.map((s) => {
            const slot = slots.get(s.value)
            const pressed = slot !== undefined
            return (
              <Toggle
                key={s.value}
                variant="outline"
                size="sm"
                pressed={pressed}
                disabled={!pressed && full}
                onPressedChange={() => toggle(s.value)}
                className="gap-1.5 text-muted-foreground aria-pressed:bg-transparent aria-pressed:text-foreground"
              >
                <span
                  aria-hidden
                  className="size-2 rounded-full border border-muted-foreground/60"
                  style={
                    pressed
                      ? {
                          background: slotColor(slot),
                          borderColor: "transparent",
                        }
                      : undefined
                  }
                />
                {s.value}
                <span className="text-muted-foreground tabular-nums">
                  {formatScore(s.latest)}
                </span>
              </Toggle>
            )
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          {series.length > MAX_LINES
            ? `Top ${MAX_LINES} by latest score shown. Select a value to show or hide its line (up to ${MAX_LINES} at once).`
            : "Select a value to show or hide its line."}
        </p>
      </div>

      <ChartContainer
        config={config}
        className="aspect-auto w-full"
        style={{ height: CHART_HEIGHT }}
        role="img"
        aria-label={`Weekly trend score over ${periods.length} weeks for ${visible.map((s) => s.value).join(", ")}. Exact values are in the heatmap table view.`}
      >
        <LineChart
          data={data}
          margin={{
            top: MARGIN_TOP,
            right: showLabels ? LABEL_GUTTER_PX : 12,
            bottom: 0,
            left: 0,
          }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            height={X_AXIS_HEIGHT}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tickFormatter={(value: string) => formatShortDate(value)}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickLine={false}
            axisLine={false}
            width={32}
          />
          <ReferenceLine
            y={SCORE_FLAT}
            stroke="var(--muted-foreground)"
            strokeDasharray="4 4"
          />
          <ChartTooltip
            cursor={{ stroke: "var(--border)" }}
            itemSorter={(item) => -Number(item.value)}
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) =>
                  payload?.[0]
                    ? `Week of ${formatDate(payload[0].payload.date)}`
                    : null
                }
                formatter={(value, name, item) => (
                  <div className="flex w-full items-center gap-2">
                    <span
                      aria-hidden
                      className="h-2.5 w-1 shrink-0 rounded-[2px]"
                      style={{ background: item.color }}
                    />
                    <span className="flex-1 text-muted-foreground">{name}</span>
                    <span className="font-medium text-foreground tabular-nums">
                      {formatScore(Number(value))}
                    </span>
                  </div>
                )}
              />
            }
          />
          {visible.map((s) => (
            <Line
              key={s.value}
              dataKey={dataKey(s.index)}
              name={s.value}
              type="monotone"
              stroke={`var(--color-${dataKey(s.index)})`}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
              connectNulls
              isAnimationActive={false}
              label={
                showLabels
                  ? (props: LabelProps) => (
                      <EndLabel
                        {...props}
                        lastIndex={periods.length - 1}
                        text={s.value}
                        offset={labelOffsets.get(s.value) ?? 0}
                      />
                    )
                  : false
              }
            />
          ))}
        </LineChart>
      </ChartContainer>
    </div>
  )
}

/** Series name at the last point of its line, nudged clear of its neighbours. */
function EndLabel({
  x,
  y,
  index,
  lastIndex,
  text,
  offset,
}: LabelProps & { lastIndex: number; text: string; offset: number }) {
  if (index !== lastIndex || x == null || y == null) return <g />
  return (
    <text
      x={Number(x) + 8}
      y={Number(y) + offset}
      dominantBaseline="middle"
      fontSize={11}
      fill="var(--foreground)"
    >
      {text}
    </text>
  )
}

/** Vertical nudges (px) that keep end-of-line labels from overlapping. */
function endLabelOffsets(lines: TrendSeries[]) {
  const pxPerPoint = PLOT_HEIGHT / 100
  const placed = lines
    .filter((line) => line.latest != null)
    .map((line) => ({
      value: line.value,
      y: (100 - line.latest!) * pxPerPoint,
    }))
    .sort((a, b) => a.y - b.y)

  const positions = placed.map((p) => p.y)
  for (let i = 1; i < positions.length; i++) {
    positions[i] = Math.max(positions[i]!, positions[i - 1]! + LABEL_GAP_PX)
  }
  // If the stack ran off the bottom, shift it back up.
  const last = positions.length - 1
  if (last >= 0 && positions[last]! > PLOT_HEIGHT) {
    positions[last] = PLOT_HEIGHT
    for (let i = last - 1; i >= 0; i--) {
      positions[i] = Math.min(positions[i]!, positions[i + 1]! - LABEL_GAP_PX)
    }
  }

  return new Map(placed.map((p, i) => [p.value, positions[i]! - p.y]))
}
