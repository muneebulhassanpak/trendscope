import {
  AtSignIcon,
  FileChartColumnIcon,
  LinkIcon,
  NewspaperIcon,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { SOURCE_TYPE_LABELS } from "@/features/sources/schemas"
import type { SourceType } from "@/features/sources/types"

export const SOURCE_TYPE_ICONS: Record<SourceType, LucideIcon> = {
  article: NewspaperIcon,
  report: FileChartColumnIcon,
  social: AtSignIcon,
  other: LinkIcon,
}

export function SourceTypeBadge({ type }: { type: SourceType }) {
  const Icon = SOURCE_TYPE_ICONS[type]
  return (
    <Badge variant="outline" className="text-muted-foreground">
      <Icon aria-hidden />
      {SOURCE_TYPE_LABELS[type]}
    </Badge>
  )
}
