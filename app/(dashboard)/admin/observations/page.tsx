import type { Metadata } from "next"

import { PlaceholderPage } from "@/components/placeholder-page"

export const metadata: Metadata = { title: "Observations" }

export default function ObservationsPage() {
  return (
    <PlaceholderPage
      title="Observations"
      description="Field notes linked to product records."
      planned={[
        "Create, edit and delete observations",
        "Link observations to products and sources",
        "Tagging",
      ]}
    />
  )
}
