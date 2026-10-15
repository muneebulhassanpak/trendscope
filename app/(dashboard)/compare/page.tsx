import type { Metadata } from "next"

import { PlaceholderPage } from "@/components/shared/placeholder-page"

export const metadata: Metadata = { title: "Compare" }

export default function ComparePage() {
  return (
    <PlaceholderPage
      title="Compare"
      description="Compare up to three products side by side."
      planned={[
        "Product picker",
        "Overlayed price history chart",
        "Spec and price comparison table",
      ]}
    />
  )
}
