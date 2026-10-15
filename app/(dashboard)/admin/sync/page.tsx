import type { Metadata } from "next"

import { PlaceholderPage } from "@/components/shared/placeholder-page"

export const metadata: Metadata = { title: "Data Sync" }

export default function DataSyncPage() {
  return (
    <PlaceholderPage
      title="Data Sync"
      description="Status of the market data API sync."
      planned={[
        "Sync history from sync_logs",
        "Manual refresh trigger",
        "Error details",
      ]}
    />
  )
}
