import type { Metadata } from "next"

import { PlaceholderPage } from "@/components/placeholder-page"

export const metadata: Metadata = { title: "Settings" }

export default function SettingsPage() {
  return (
    <PlaceholderPage
      title="Settings"
      description="Profile, appearance and user roles."
      planned={[
        "Profile details",
        "Theme preference",
        "Manage admin and viewer roles",
      ]}
    />
  )
}
