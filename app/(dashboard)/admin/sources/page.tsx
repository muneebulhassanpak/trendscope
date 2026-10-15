import type { Metadata } from "next"

import { PlaceholderPage } from "@/components/shared/placeholder-page"

export const metadata: Metadata = { title: "Sources" }

export default function SourcesPage() {
  return (
    <PlaceholderPage
      title="Sources"
      description="External links and research references."
      planned={[
        "Add and manage sources",
        "Source types: article, report, social",
        "See where each source is cited",
      ]}
    />
  )
}
