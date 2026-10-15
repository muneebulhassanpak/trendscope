import { CircleCheckIcon, CircleXIcon, LoaderCircleIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { SyncStatus } from "@/features/sync/types"

const STATUS = {
  success: {
    label: "Success",
    icon: CircleCheckIcon,
    className: "bg-positive/10 text-positive",
  },
  running: {
    label: "Running",
    icon: LoaderCircleIcon,
    className: "bg-muted text-foreground [&>svg]:animate-spin",
  },
  failed: {
    label: "Failed",
    icon: CircleXIcon,
    className: "bg-destructive/10 text-destructive dark:bg-destructive/20",
  },
} satisfies Record<
  SyncStatus,
  { label: string; icon: React.ComponentType; className: string }
>

/** Run status with an icon, so color is never the only cue. */
export function SyncStatusBadge({ status }: { status: SyncStatus }) {
  const { label, icon: Icon, className } = STATUS[status]
  return (
    <Badge variant="secondary" className={cn(className)}>
      <Icon aria-hidden data-icon="inline-start" />
      {label}
    </Badge>
  )
}
