import Link from "next/link"
import {
  ChevronRightIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  type LucideIcon,
} from "lucide-react"

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
  EmptyTitle,
} from "@/components/ui/empty"
import { Sparkline } from "@/components/shared/sparkline"
import { formatScore, formatScoreChange } from "@/lib/format"
import { cn } from "@/lib/utils"
import { ScoreChange } from "@/features/trends/components/score-change"
import { CHANGE_WEEKS, SCORE_FLAT } from "@/features/trends/score"
import type { TrendSeries } from "@/features/trends/types"

const LIST_SIZE = 5

type Mover = TrendSeries & { latest: number }

/** "Rising" (score above 50) and "Cooling" (below 50) lists, strongest first. */
export function TrendMovers({
  series,
  noun,
}: {
  series: TrendSeries[]
  /** Plural label for the dimension, e.g. "colors". */
  noun: string
}) {
  const scored = series.filter((s): s is Mover => s.latest != null)
  // Classify at display precision so a "50.0" never lands in either list.
  const offset = (s: Mover) => Math.round((s.latest - SCORE_FLAT) * 10)
  const rising = scored
    .filter((s) => offset(s) > 0)
    .sort((a, b) => b.latest - a.latest)
  const cooling = scored
    .filter((s) => offset(s) < 0)
    .sort((a, b) => a.latest - b.latest)

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <MoverCard
        title="Rising"
        description="Score above 50 — prices gaining over 28 days"
        icon={TrendingUpIcon}
        iconClassName="text-positive"
        movers={rising}
        emptyText={`No ${noun} are scoring above 50 this week.`}
      />
      <MoverCard
        title="Cooling"
        description="Score below 50 — prices slipping over 28 days"
        icon={TrendingDownIcon}
        iconClassName="text-negative"
        movers={cooling}
        emptyText={`No ${noun} are scoring below 50 this week.`}
      />
    </div>
  )
}

function MoverCard({
  title,
  description,
  icon: Icon,
  iconClassName,
  movers,
  emptyText,
}: {
  title: string
  description: string
  icon: LucideIcon
  iconClassName: string
  movers: Mover[]
  emptyText: string
}) {
  const shown = movers.slice(0, LIST_SIZE)
  const headingId = `movers-${title.toLowerCase()}`

  return (
    <Card>
      <CardHeader>
        <CardTitle id={headingId} className="flex items-center gap-2">
          <Icon className={cn("size-4", iconClassName)} aria-hidden />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {shown.length ? (
          <>
            <div
              aria-hidden
              className="grid grid-cols-[minmax(0,1fr)_3rem_5.5rem_1rem] gap-3 px-2 pb-2 text-xs text-muted-foreground sm:grid-cols-[minmax(0,1fr)_6rem_3rem_5.5rem_1rem]"
            >
              <span />
              <span className="hidden sm:block">26 weeks</span>
              <span className="text-right">Score</span>
              <span className="text-right">vs {CHANGE_WEEKS} wk</span>
            </div>
            <ul aria-labelledby={headingId} className="-mx-2 flex flex-col">
              {shown.map((mover) => (
                <li key={mover.value}>
                  <Link
                    href={mover.href}
                    aria-label={`${mover.value}: score ${formatScore(mover.latest)}, ${formatScoreChange(mover.change)} versus ${CHANGE_WEEKS} weeks ago. View products`}
                    className="group grid grid-cols-[minmax(0,1fr)_3rem_5.5rem_1rem] items-center gap-3 rounded-lg px-2 py-2 transition-colors outline-none hover:bg-muted/60 focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:grid-cols-[minmax(0,1fr)_6rem_3rem_5.5rem_1rem]"
                  >
                    <span className="truncate font-medium">{mover.value}</span>
                    <Sparkline
                      values={mover.scores.filter(
                        (s): s is number => s != null
                      )}
                      width={96}
                      height={24}
                      className="hidden text-muted-foreground sm:block"
                    />
                    <span className="text-right font-medium tabular-nums">
                      {formatScore(mover.latest)}
                    </span>
                    <ScoreChange value={mover.change} className="justify-end" />
                    <ChevronRightIcon
                      aria-hidden
                      className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
                    />
                  </Link>
                </li>
              ))}
            </ul>
            {movers.length > shown.length && (
              <p className="px-0 pt-2 text-xs text-muted-foreground">
                +{movers.length - shown.length} more in the chart below
              </p>
            )}
          </>
        ) : (
          <Empty className="p-6">
            <EmptyHeader>
              <EmptyTitle>Nothing {title.toLowerCase()}</EmptyTitle>
              <EmptyDescription>{emptyText}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}
