import { formatDate, formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

/** "Oct 12, 2026 · 2 min read" */
export function ArticleMeta({
  publishedAt,
  readingMinutes,
  className,
}: {
  publishedAt: string | null
  readingMinutes: number
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground",
        className
      )}
    >
      {publishedAt && (
        <>
          <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
          <span aria-hidden>·</span>
        </>
      )}
      <span>{formatNumber(readingMinutes)} min read</span>
    </div>
  )
}
