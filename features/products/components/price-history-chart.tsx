"use client"

import { useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
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
  formatCompactPrice,
  formatDate,
  formatPrice,
  formatShortDate,
} from "@/lib/format"
import type { PricePoint } from "@/features/products/types"

const PERIODS = { "1M": 30, "3M": 90, "6M": 182, "1Y": 365 } as const
type Period = keyof typeof PERIODS

const chartConfig = {
  price: { label: "Price", color: "var(--chart-1)" },
} satisfies ChartConfig

export function PriceHistoryChart({
  points,
  retailPrice,
}: {
  points: PricePoint[]
  retailPrice: number | null
}) {
  const [period, setPeriod] = useState<Period>("3M")

  const data = useMemo(
    () => points.slice(-PERIODS[period] - 1),
    [points, period]
  )
  const change =
    data.length > 1 ? (data.at(-1)!.price / data[0]!.price - 1) * 100 : null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          Change over period <ChangeBadge value={change} />
        </div>
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

      <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
        <AreaChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
          <defs>
            <linearGradient id="price-fill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-price)"
                stopOpacity={0.3}
              />
              <stop
                offset="100%"
                stopColor="var(--color-price)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
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
            domain={["auto", "auto"]}
            tickFormatter={(value: number) => formatCompactPrice(value)}
          />
          {retailPrice != null && (
            <ReferenceLine
              y={retailPrice}
              stroke="var(--muted-foreground)"
              strokeDasharray="4 4"
              ifOverflow="extendDomain"
              label={{
                value: "Retail",
                position: "insideTopLeft",
                fill: "var(--muted-foreground)",
                fontSize: 11,
              }}
            />
          )}
          <ChartTooltip
            cursor={{ stroke: "var(--border)" }}
            content={
              <ChartTooltipContent
                indicator="line"
                labelFormatter={(_, payload) =>
                  payload?.[0] ? formatDate(payload[0].payload.date) : null
                }
                formatter={(value) => (
                  <span className="font-medium tabular-nums">
                    {formatPrice(Number(value))}
                  </span>
                )}
              />
            }
          />
          <Area
            dataKey="price"
            type="monotone"
            stroke="var(--color-price)"
            strokeWidth={2}
            fill="url(#price-fill)"
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
