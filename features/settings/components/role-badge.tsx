import { EyeIcon, ShieldCheckIcon, UserIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { USER_ROLES } from "@/features/settings/schemas"
import type { UserRole } from "@/features/settings/types"

const ICONS = {
  admin: ShieldCheckIcon,
  viewer: UserIcon,
  demo: EyeIcon,
} satisfies Record<UserRole, React.ComponentType>

export function RoleBadge({ role }: { role: UserRole }) {
  const Icon = ICONS[role]
  return (
    <Badge variant={role === "admin" ? "default" : "secondary"}>
      <Icon aria-hidden data-icon="inline-start" />
      {USER_ROLES[role].label}
    </Badge>
  )
}
