import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon } from "lucide-react"

import { formatScoreChange } from "@/lib/format"
import { cn } from "@/lib/utils"

/** Signed change in score points with a direction icon; color is never the only cue. */
export function ScoreChange({
  value,
  className,
}: {
  value: number | null
  className?: string
}) {
  // Match the displayed precision so "0.0 pts" never shows an arrow.
  const rounded = value == null ? 0 : Math.round(value * 10)
  const direction = rounded > 0 ? "up" : rounded < 0 ? "down" : "flat"
  const Icon =
    direction === "up"
      ? ArrowUpRightIcon
      : direction === "down"
        ? ArrowDownRightIcon
        : MinusIcon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-sm font-medium whitespace-nowrap tabular-nums",
        direction === "up" && "text-positive",
        direction === "down" && "text-negative",
        direction === "flat" && "text-muted-foreground",
        className
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      <span className="sr-only">
        {direction === "up"
          ? "Up"
          : direction === "down"
            ? "Down"
            : "Unchanged"}
      </span>
      {formatScoreChange(value)}
    </span>
  )
}
