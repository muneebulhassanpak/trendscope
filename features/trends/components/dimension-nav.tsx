import Link from "next/link"

import { cn } from "@/lib/utils"
import { LinkPendingIndicator } from "@/features/trends/components/link-pending-indicator"
import { TREND_DIMENSIONS } from "@/features/trends/schemas"
import type { TrendDimension } from "@/features/trends/types"

/** Segmented control of links: the dimension lives in the URL, so it is shareable. */
export function DimensionNav({ active }: { active: TrendDimension }) {
  return (
    <nav
      aria-label="Trend dimension"
      className="inline-flex h-9 w-full items-center rounded-lg bg-muted p-[3px] text-muted-foreground sm:w-fit"
    >
      {(Object.keys(TREND_DIMENSIONS) as TrendDimension[]).map((dimension) => {
        const current = dimension === active
        return (
          <Link
            key={dimension}
            href={`/trends?dimension=${dimension}`}
            scroll={false}
            aria-current={current ? "page" : undefined}
            className={cn(
              "relative inline-flex h-full flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-3 text-sm font-medium whitespace-nowrap transition-colors outline-none hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:flex-none",
              current &&
                "bg-background text-foreground shadow-sm dark:border-input dark:bg-input/30"
            )}
          >
            {TREND_DIMENSIONS[dimension].label}
            <LinkPendingIndicator />
          </Link>
        )
      })}
    </nav>
  )
}
