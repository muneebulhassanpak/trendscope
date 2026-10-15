import {
  ArrowRightIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  type LucideIcon,
} from "lucide-react"

import {
  Card,
  CardAction,
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
import { ButtonLink } from "@/components/shared/button-link"
import { formatNumber, formatShortDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { TrendHighlights, TrendSignal } from "@/features/dashboard/types"

const DIMENSION_LABELS: Record<TrendSignal["dimension"], string> = {
  color: "Color",
  material: "Material",
  category: "Category",
}

export function TrendHighlightsCard({
  periodDate,
  rising,
  cooling,
}: TrendHighlights) {
  const hasSignals = rising.length > 0 || cooling.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trending now</CardTitle>
        <CardDescription>
          Momentum score 0–100 · 50 is flat
          {periodDate && <> · week of {formatShortDate(periodDate)}</>}
        </CardDescription>
        <CardAction>
          <ButtonLink
            variant="ghost"
            size="sm"
            href="/trends"
            aria-label="View all trends"
          >
            Trends
            <ArrowRightIcon data-icon="inline-end" />
          </ButtonLink>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-5">
        {hasSignals ? (
          <>
            <SignalGroup
              title="Heating up"
              icon={TrendingUpIcon}
              signals={rising}
            />
            <SignalGroup
              title="Cooling off"
              icon={TrendingDownIcon}
              signals={cooling}
            />
          </>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <TrendingUpIcon />
              </EmptyMedia>
              <EmptyTitle>No trend data yet</EmptyTitle>
              <EmptyDescription>
                Weekly momentum scores appear after the next market sync.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}

function SignalGroup({
  title,
  icon: Icon,
  signals,
}: {
  title: string
  icon: LucideIcon
  signals: TrendSignal[]
}) {
  if (!signals.length) return null

  return (
    <section className="flex flex-col gap-2">
      <h3 className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" aria-hidden />
        {title}
      </h3>
      <ul className="flex flex-col gap-3">
        {signals.map((signal) => (
          <li key={signal.id} className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{signal.value}</div>
              <div className="text-xs text-muted-foreground">
                {DIMENSION_LABELS[signal.dimension]}
              </div>
            </div>
            <ScoreMeter score={signal.score} />
            <span className="w-7 text-right font-medium tabular-nums">
              {formatNumber(Math.round(signal.score))}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Diverging bar from the neutral midpoint (50): right = rising, left = cooling. */
function ScoreMeter({ score }: { score: number }) {
  const rising = score >= 50
  const extent = Math.min(Math.abs(score - 50), 50)

  return (
    <div
      aria-hidden
      className="relative h-1.5 w-20 shrink-0 rounded-full bg-muted sm:w-24"
    >
      <div className="absolute inset-y-[-2px] left-1/2 w-px bg-border" />
      <div
        className={cn(
          "absolute inset-y-0 rounded-full",
          rising ? "left-1/2 bg-positive" : "right-1/2 bg-negative"
        )}
        style={{ width: `${extent}%` }}
      />
    </div>
  )
}
