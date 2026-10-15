import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ArticleStatus } from "@/features/articles/types"

/** Labelled status with a dot — the text carries the meaning, not the color. */
export function ArticleStatusBadge({
  status,
  className,
}: {
  status: ArticleStatus
  className?: string
}) {
  const published = status === "published"
  return (
    <Badge variant="outline" className={cn("gap-1.5", className)}>
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full",
          published ? "bg-positive" : "bg-muted-foreground/60"
        )}
      />
      {published ? "Published" : "Draft"}
    </Badge>
  )
}
