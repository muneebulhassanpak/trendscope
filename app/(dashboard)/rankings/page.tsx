import type { Metadata } from "next"

import { PlaceholderPage } from "@/components/shared/placeholder-page"

export const metadata: Metadata = { title: "Rankings" }

export default function RankingsPage() {
  return (
    <PlaceholderPage
      title="Rankings"
      description="Top gainers, losers and most popular products."
      planned={[
        "Gainers and losers over 7d / 30d / 1y",
        "Rankings by category",
        "Trend indicators per product",
      ]}
    />
  )
}
