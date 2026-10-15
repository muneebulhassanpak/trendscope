import { InfoIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { formatNumber, formatPercent } from "@/lib/format"
import { impliedPriceChange } from "@/features/trends/score"

const EXAMPLES = [75, 60, 40, 25]

/** One-line reading guide plus a popover with the exact formula. */
export function ScoreExplainer() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
      <p>
        Trend score 0–100: <span className="text-foreground">50 is flat</span>,
        above 50 prices are rising, below 50 they are cooling.
      </p>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="link"
              size="sm"
              className="h-auto gap-1 px-0 text-muted-foreground hover:text-foreground"
            />
          }
        >
          <InfoIcon />
          How it&apos;s computed
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[min(22rem,calc(100vw-2rem))] gap-3 p-4"
        >
          <PopoverHeader>
            <PopoverTitle>How the trend score works</PopoverTitle>
            <PopoverDescription>
              Price momentum of every tracked product that shares the color,
              material or category, recomputed weekly.
            </PopoverDescription>
          </PopoverHeader>
          <p className="rounded-md bg-muted px-3 py-2 font-mono text-xs">
            score = 50 + 2.5 × avg. 28-day price change (%)
          </p>
          <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
            <li>
              Each product&apos;s latest price that week is compared with its
              price 28 days earlier; the changes are averaged.
            </li>
            <li>
              Capped to 0–100.{" "}
              {EXAMPLES.map(
                (score) =>
                  `${formatNumber(score)} ≈ ${formatPercent(impliedPriceChange(score))}`
              ).join(" · ")}
            </li>
            <li>
              Changes are in score points, not percent: 1 pt ≈ 0.4 percentage
              points of price change.
            </li>
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  )
}
