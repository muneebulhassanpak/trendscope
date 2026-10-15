import type { Metadata } from "next"

import { PlaceholderPage } from "@/components/shared/placeholder-page"

export const metadata: Metadata = { title: "Products" }

export default function ProductsPage() {
  return (
    <PlaceholderPage
      title="Products"
      description="Search and filter every tracked product."
      planned={[
        "Full-text search across name, color and material",
        "Filters: brand, category, color, material, price range",
        "Sortable table with price change indicators",
      ]}
    />
  )
}
