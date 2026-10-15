import type { Metadata } from "next"

import { PlaceholderPage } from "@/components/shared/placeholder-page"

export const metadata: Metadata = { title: "Insights" }

export default function InsightsPage() {
  return (
    <PlaceholderPage
      title="Insights"
      description="Published trend reports and market analyses."
      planned={[
        "Article list with cover images",
        "Article detail pages",
        "Linked products per report",
      ]}
    />
  )
}
