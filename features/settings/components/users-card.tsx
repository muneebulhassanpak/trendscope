import { UsersIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { formatDate } from "@/lib/format"
import { RoleSelect } from "@/features/settings/components/role-select"
import { UserAvatar } from "@/features/settings/components/user-avatar"
import type { Profile } from "@/features/settings/types"

export function UsersCard({
  profiles,
  currentUserId,
}: {
  profiles: Profile[]
  currentUserId: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users &amp; roles</CardTitle>
        <CardDescription>
          Admins can edit, demo accounts see the admin area read-only, viewers
          see market pages only. You can&apos;t change your own role.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {profiles.length ? (
          <ul aria-label="Users" className="divide-y">
            {profiles.map((profile) => {
              const isSelf = profile.id === currentUserId
              const name = profile.full_name ?? profile.email
              return (
                <li
                  key={profile.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <UserAvatar name={name} className="size-9" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{name}</span>
                      {isSelf && <Badge variant="outline">You</Badge>}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {profile.email}
                      <span className="hidden sm:inline">
                        {" "}
                        · Joined {formatDate(profile.created_at)}
                      </span>
                    </div>
                  </div>
                  <RoleSelect
                    userId={profile.id}
                    email={profile.email}
                    role={profile.role}
                    disabled={isSelf}
                  />
                </li>
              )
            })}
          </ul>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UsersIcon />
              </EmptyMedia>
              <EmptyTitle>No users yet</EmptyTitle>
              <EmptyDescription>
                Accounts appear here after they sign up.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}
