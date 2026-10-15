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
  const direction =
    value == null || value === 0 ? "flat" : value > 0 ? "up" : "down"
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
      {formatPercent(value)}
    </span>
  )
}
