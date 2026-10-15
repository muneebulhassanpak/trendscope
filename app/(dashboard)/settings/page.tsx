import type { Metadata } from "next"

import { PageHeader } from "@/components/shared/page-header"
import { requireAdminArea } from "@/lib/auth"
import { AppearanceCard } from "@/features/settings/components/appearance-card"
import { ProfileCard } from "@/features/settings/components/profile-card"
import { UsersCard } from "@/features/settings/components/users-card"
import { listProfiles } from "@/features/settings/queries"

export const metadata: Metadata = { title: "Settings" }

export default async function SettingsPage() {
  const viewer = await requireAdminArea()
  // Only admins manage users; other roles never load the list.
  const profiles = viewer.role === "admin" ? await listProfiles() : null

  return (
    <>
      <PageHeader
        title="Settings"
        description="Your profile, appearance and who can access TrendScope."
      />

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <ProfileCard viewer={viewer} />
        <AppearanceCard />
      </div>

      {profiles && <UsersCard profiles={profiles} currentUserId={viewer.id} />}
    </>
  )
}
