import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon } from "lucide-react"

import { formatPercent } from "@/lib/format"
import { cn } from "@/lib/utils"

/** Signed percentage with direction icon; color is never the only cue. */
export function ChangeBadge({
  value,
  className,
}: {
  value: number | null | undefined
  className?: string
}) {
  // Direction follows the displayed (1-decimal) value so "0.0%" never shows an arrow.
  const shown = value == null ? null : Math.round(value * 10) / 10
  const direction =
    shown == null || shown === 0 ? "flat" : shown > 0 ? "up" : "down"
  const Icon =
    direction === "up"
      ? ArrowUpRightIcon
      : direction === "down"
        ? ArrowDownRightIcon
        : MinusIcon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-sm font-medium tabular-nums",
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
      {formatPercent(shown === 0 ? 0 : value)}
    </span>
  )
}
