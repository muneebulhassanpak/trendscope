import type { Metadata } from "next"

import { PlaceholderPage } from "@/components/shared/placeholder-page"

export const metadata: Metadata = { title: "Articles" }

export default function ArticlesPage() {
  return (
    <PlaceholderPage
      title="Articles"
      description="Write and publish trend reports."
      planned={[
        "Rich text editor",
        "Draft / published workflow",
        "Link articles to products",
      ]}
    />
  )
}
