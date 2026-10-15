import {
  ArrowRightIcon,
  CalendarClockIcon,
  ChartLineIcon,
  PackageIcon,
  PlugIcon,
  TrendingUpIcon,
  type LucideIcon,
} from "lucide-react"

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatNumber } from "@/lib/format"
import { providerLabel } from "@/features/sync/provider"
import type { SyncOverview } from "@/features/sync/types"

type Step = {
  title: string
  description: string
  metric: string
  icon: LucideIcon
}

export function SyncPipeline({ overview }: { overview: SyncOverview }) {
  const steps: Step[] = [
    {
      title: "Provider",
      description: "Catalog and daily prices fetched through one interface.",
      metric: providerLabel(overview.provider),
      icon: PlugIcon,
    },
    {
      title: "Catalog upsert",
      description: "Brands, categories and products matched on external ID.",
      metric: `${formatNumber(overview.productCount)} products`,
      icon: PackageIcon,
    },
    {
      title: "Price history",
      description: "365-day backfill for new products, then missing days only.",
      metric: `${formatNumber(overview.pricePointCount)} points`,
      icon: ChartLineIcon,
    },
    {
      title: "Trend snapshots",
      description: "26 weeks of color, material and category scores rebuilt.",
      metric: `${formatNumber(overview.trendSnapshotCount)} snapshots`,
      icon: TrendingUpIcon,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>How the sync works</CardTitle>
        <CardDescription>
          Idempotent: re-running only fills gaps, so it is always safe.
        </CardDescription>
      </CardHeader>

      <ol
        aria-label="Sync pipeline"
        className="grid gap-3 px-(--card-spacing) lg:grid-cols-4 lg:gap-8"
      >
        {steps.map((step, index) => (
          <li key={step.title} className="relative flex gap-3 lg:flex-col">
            <div className="relative flex flex-col items-center lg:flex-row">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground ring-1 ring-foreground/10">
                <step.icon className="size-4" aria-hidden />
              </span>
              {index < steps.length - 1 && (
                <>
                  {/* Vertical connector (stacked layout) */}
                  <span
                    aria-hidden
                    className="mt-1 w-px flex-1 bg-border lg:hidden"
                  />
                  {/* Horizontal connector with arrow (row layout) */}
                  <span
                    aria-hidden
                    className="absolute top-1/2 left-12 hidden h-px w-[calc(100%-1rem)] -translate-y-1/2 bg-border lg:block"
                  />
                </>
              )}
            </div>
            {index < steps.length - 1 && (
              <ArrowRightIcon
                aria-hidden
                className="absolute top-2.5 -right-6 hidden size-4 bg-card text-muted-foreground lg:block"
              />
            )}
            <div className="flex min-w-0 flex-col gap-0.5 pb-3 lg:pb-0">
              <span className="text-xs text-muted-foreground tabular-nums">
                Step {index + 1}
              </span>
              <span className="font-medium">{step.title}</span>
              <p className="text-muted-foreground">{step.description}</p>
              <span className="mt-1 font-mono text-xs text-foreground tabular-nums">
                {step.metric}
              </span>
            </div>
          </li>
        ))}
      </ol>

      <CardFooter className="flex-col items-start gap-2 text-muted-foreground sm:flex-row sm:items-center sm:gap-3">
        <span className="inline-flex items-center gap-2">
          <CalendarClockIcon className="size-4 shrink-0" aria-hidden />
          <span>
            Runs daily at 03:15 UTC via the{" "}
            <span className="font-medium text-foreground">Market data</span>{" "}
            GitHub workflow.
          </span>
        </span>
        <span className="hidden sm:inline" aria-hidden>
          ·
        </span>
        <span>
          Platform cron can call{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">
            GET /api/cron/sync
          </code>
        </span>
      </CardFooter>
    </Card>
  )
}
