import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

function initials(name: string) {
  return name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("")
}

export function UserAvatar({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  return (
    <Avatar className={cn("rounded-lg after:rounded-lg", className)}>
      <AvatarFallback className="rounded-lg">{initials(name)}</AvatarFallback>
    </Avatar>
  )
}
