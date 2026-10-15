import Link from "next/link"

import { ChangeBadge } from "@/components/shared/change-badge"
import { StatCard } from "@/components/shared/stat-card"
import { formatNumber } from "@/lib/format"
import type { DashboardSummary, Mover } from "@/features/dashboard/types"

export function DashboardStats({
  summary,
  topGainer,
}: {
  summary: DashboardSummary
  topGainer: Mover | undefined
}) {
  const categories = summary.categoryCount

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Tracked products"
        value={formatNumber(summary.productCount)}
        detail={`Across ${formatNumber(categories)} ${categories === 1 ? "category" : "categories"}`}
      />
      <StatCard
        label="Market index · 30d"
        value={
          <span className="flex items-baseline gap-2">
            {summary.marketIndex == null
              ? "—"
              : formatNumber(Math.round(summary.marketIndex))}
            <ChangeBadge value={summary.marketIndexChange30d} />
          </span>
        }
        detail="Resale vs retail · 100 = at retail"
      />
      <StatCard
        label="Top gainer · 30d"
        value={
          <ChangeBadge
            value={topGainer?.change_30d_pct}
            className="text-2xl font-semibold [&>svg]:size-5"
          />
        }
        detail={
          topGainer ? (
            <Link
              href={`/products/${topGainer.slug}`}
              className="block truncate hover:text-foreground hover:underline"
            >
              {topGainer.name}
            </Link>
          ) : (
            "No gainers this month"
          )
        }
      />
      <StatCard
        label="New observations · 7d"
        value={formatNumber(summary.observationsLast7d)}
        detail="Field notes from the research team"
      />
    </div>
  )
}
