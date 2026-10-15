import type { Metadata } from "next"

import { PlaceholderPage } from "@/components/shared/placeholder-page"

export const metadata: Metadata = { title: "Trends" }

export default function TrendsPage() {
  return (
    <PlaceholderPage
      title="Trends"
      description="How colors, materials and categories are moving."
      planned={[
        "Trend score charts by dimension",
        "Rising and falling attributes",
        "Weekly history",
      ]}
    />
  )
}
