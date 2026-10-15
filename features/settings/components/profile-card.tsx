import { LockIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Viewer } from "@/lib/auth"
import { ProfileNameForm } from "@/features/settings/components/profile-name-form"
import { RoleBadge } from "@/features/settings/components/role-badge"
import { SignOutButton } from "@/features/settings/components/sign-out-button"
import { UserAvatar } from "@/features/settings/components/user-avatar"

export function ProfileCard({ viewer }: { viewer: Viewer }) {
  const name = viewer.fullName ?? viewer.email

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>How you appear across TrendScope.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <UserAvatar name={name} className="size-11" />
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium">{name}</div>
            <div className="truncate text-muted-foreground">{viewer.email}</div>
          </div>
          <RoleBadge role={viewer.role} />
        </div>

        {viewer.role === "admin" ? (
          <ProfileNameForm fullName={viewer.fullName} />
        ) : (
          <p className="flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2 text-muted-foreground">
            <LockIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            The demo profile is read-only. Sign in as an admin to edit it.
          </p>
        )}
      </CardContent>
      <CardFooter className="mt-auto justify-between gap-3">
        <span className="text-muted-foreground">Done for now?</span>
        <SignOutButton />
      </CardFooter>
    </Card>
  )
}
