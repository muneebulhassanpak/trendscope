"use client"

import { useRef, useState } from "react"
import { Grid3x3Icon, TableIcon } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  formatDate,
  formatNumber,
  formatPercent,
  formatScore,
  formatShortDate,
} from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  SCORE_FLAT,
  impliedPriceChange,
  isClampedScore,
} from "@/features/trends/score"
import type { TrendSeries } from "@/features/trends/types"

/** Distance from 50 at which a cell reaches full color (20 ↔ 80). */
const FULL_SCALE_POINTS = 30
const LABEL_EVERY_WEEKS = 4
/** Half the tooltip's max width, so it never overflows the card (or the page). */
const TOOLTIP_HALF_WIDTH = 112

type View = "heatmap" | "table"
type ActiveCell = { row: number; col: number; x: number; y: number }

/** Diverging fill: blue below 50, neutral gray at 50, red above. */
function scoreFill(score: number) {
  const intensity = Math.min(
    1,
    Math.abs(score - SCORE_FLAT) / FULL_SCALE_POINTS
  )
  const pole =
    score >= SCORE_FLAT ? "var(--diverging-high)" : "var(--diverging-low)"
  return `color-mix(in oklab, var(--diverging-mid), ${pole} ${Math.round(intensity * 100)}%)`
}

function describeScore(score: number) {
  const change = formatPercent(impliedPriceChange(score))
  return isClampedScore(score)
    ? `${score > SCORE_FLAT ? "≥" : "≤"} ${change} avg. 28-day price change`
    : `≈ ${change} avg. 28-day price change`
}

export function TrendHeatmap({
  periods,
  series,
  noun,
}: {
  periods: string[]
  series: TrendSeries[]
  /** Plural label for the dimension, e.g. "colors". */
  noun: string
}) {
  const [view, setView] = useState<View>("heatmap")
  const [active, setActive] = useState<ActiveCell | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // Hottest first, so the strongest rows lead.
  const rows = [...series].sort(
    (a, b) => (b.latest ?? -Infinity) - (a.latest ?? -Infinity)
  )

  function activate(row: number, col: number) {
    const cell = gridRef.current?.querySelector<HTMLElement>(
      `[data-row="${row}"][data-col="${col}"]`
    )
    const wrapper = wrapperRef.current
    if (!cell || !wrapper) return
    cell.scrollIntoView({ block: "nearest", inline: "nearest" })
    const cellBox = cell.getBoundingClientRect()
    const wrapperBox = wrapper.getBoundingClientRect()
    setActive({
      row,
      col,
      x: Math.min(
        Math.max(
          cellBox.left + cellBox.width / 2 - wrapperBox.left,
          TOOLTIP_HALF_WIDTH
        ),
        wrapperBox.width - TOOLTIP_HALF_WIDTH
      ),
      y: cellBox.top - wrapperBox.top,
    })
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const moves: Record<string, [number, number]> = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    }
    if (event.key === "Escape") return setActive(null)
    const move = moves[event.key]
    if (!move) return
    event.preventDefault()
    const row = active ? active.row + move[0] : 0
    const col = active ? active.col + move[1] : periods.length - 1
    activate(
      Math.min(rows.length - 1, Math.max(0, row)),
      Math.min(periods.length - 1, Math.max(0, col))
    )
  }

  const activeScore = active ? rows[active.row]?.scores[active.col] : null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ScaleLegend />
        <ToggleGroup
          variant="outline"
          size="sm"
          value={[view]}
          onValueChange={(value) => value[0] && setView(value[0] as View)}
          aria-label="Heatmap display"
        >
          <ToggleGroupItem value="heatmap" aria-label="View as heatmap">
            <Grid3x3Icon />
            Heatmap
          </ToggleGroupItem>
          <ToggleGroupItem value="table" aria-label="View as table">
            <TableIcon />
            Table
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {view === "heatmap" ? (
        <div ref={wrapperRef} className="relative">
          <div className="overflow-x-auto pb-1">
            <div
              ref={gridRef}
              role="img"
              tabIndex={0}
              aria-label={`Heatmap of weekly trend scores for ${rows.length} ${noun} over ${periods.length} weeks. Use the arrow keys to inspect cells, or switch to the table view.`}
              onKeyDown={onKeyDown}
              onBlur={() => setActive(null)}
              onPointerLeave={() => setActive(null)}
              className="grid min-w-[36rem] gap-0.5 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              style={{
                gridTemplateColumns: `minmax(5rem, 7rem) repeat(${periods.length}, minmax(1rem, 1fr))`,
              }}
            >
              <span />
              {periods.map((date, col) => (
                <span
                  key={date}
                  className="relative h-5 text-[11px] text-muted-foreground"
                >
                  {col % LABEL_EVERY_WEEKS === 0 && (
                    <span className="absolute bottom-1 left-0 whitespace-nowrap">
                      {formatShortDate(date)}
                    </span>
                  )}
                </span>
              ))}

              {rows.map((s, row) => (
                <div key={s.value} className="contents">
                  <span className="sticky left-0 z-10 flex items-center truncate bg-card pr-2 text-xs font-medium">
                    {s.value}
                  </span>
                  {s.scores.map((score, col) => {
                    const isActive = active?.row === row && active.col === col
                    return (
                      <span
                        key={periods[col]}
                        data-row={row}
                        data-col={col}
                        onPointerEnter={() => activate(row, col)}
                        className={cn(
                          "h-7 rounded-[3px] transition-[box-shadow]",
                          score == null &&
                            "border border-dashed border-muted-foreground/30",
                          isActive &&
                            "ring-2 ring-foreground ring-offset-1 ring-offset-card"
                        )}
                        style={
                          score == null
                            ? undefined
                            : { background: scoreFill(score) }
                        }
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {active && (
            <div
              role="status"
              className="pointer-events-none absolute z-20 w-max max-w-56 -translate-x-1/2 -translate-y-full rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl"
              style={{ left: active.x, top: active.y - 6 }}
            >
              <div className="font-medium">{rows[active.row]?.value}</div>
              <div className="text-muted-foreground">
                Week of {formatDate(periods[active.col]!)}
              </div>
              {activeScore != null ? (
                <>
                  <div className="mt-1 flex items-baseline justify-between gap-3">
                    <span className="text-muted-foreground">Score</span>
                    <span className="font-medium tabular-nums">
                      {formatScore(activeScore)}
                    </span>
                  </div>
                  <div className="text-muted-foreground">
                    {describeScore(activeScore)}
                  </div>
                </>
              ) : (
                <div className="mt-1 text-muted-foreground">
                  No data this week
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="max-h-[28rem] overflow-y-auto rounded-lg ring-1 ring-foreground/10">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow className="hover:bg-transparent">
                <TableHead scope="col" className="pl-3">
                  Week of
                </TableHead>
                {rows.map((s) => (
                  <TableHead key={s.value} scope="col" className="text-right">
                    {s.value}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {periods
                .map((date, col) => ({ date, col }))
                .reverse()
                .map(({ date, col }) => (
                  <TableRow key={date}>
                    <TableHead
                      scope="row"
                      className="pl-3 font-normal text-muted-foreground"
                    >
                      {formatDate(date)}
                    </TableHead>
                    {rows.map((s) => (
                      <TableCell
                        key={s.value}
                        className="text-right tabular-nums"
                      >
                        {formatScore(s.scores[col])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

function ScaleLegend() {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span>Cooling</span>
      <div className="flex flex-col gap-0.5">
        <span
          aria-hidden
          className="h-2 w-36 rounded-full"
          style={{
            background:
              "linear-gradient(to right in oklab, var(--diverging-low), var(--diverging-mid), var(--diverging-high))",
          }}
        />
        <span className="flex justify-between text-[10px] tabular-nums">
          <span>≤{formatNumber(SCORE_FLAT - FULL_SCALE_POINTS)}</span>
          <span>{formatNumber(SCORE_FLAT)}</span>
          <span>≥{formatNumber(SCORE_FLAT + FULL_SCALE_POINTS)}</span>
        </span>
      </div>
      <span>Rising</span>
    </div>
  )
}
