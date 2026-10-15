import { StatCard } from "@/components/shared/stat-card"
import { formatDateTime, formatNumber, formatRelativeTime } from "@/lib/format"
import { providerLabel } from "@/features/sync/provider"
import type { SyncOverview } from "@/features/sync/types"

export function SyncStats({ overview }: { overview: SyncOverview }) {
  const { lastSuccess } = overview
  const added = lastSuccess?.records_updated ?? 0

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Provider"
        value={providerLabel(overview.provider)}
        detail={
          <>
            <code className="font-mono text-xs">{overview.provider}</code> ·
            MarketDataProvider
          </>
        }
      />
      <StatCard
        label="Last successful sync"
        value={
          lastSuccess ? (
            <time dateTime={lastSuccess.started_at}>
              {formatRelativeTime(lastSuccess.started_at)}
            </time>
          ) : (
            "Never"
          )
        }
        detail={
          lastSuccess
            ? `${formatDateTime(lastSuccess.started_at)} · ${added ? `+${formatNumber(added)} prices` : "no new prices"}`
            : "Run a sync to load market data"
        }
      />
      <StatCard
        label="Catalog"
        value={formatNumber(overview.productCount)}
        detail={`${overview.productCount === 1 ? "Product" : "Products"} upserted by external ID`}
      />
      <StatCard
        label="Price points tracked"
        value={formatNumber(overview.pricePointCount)}
        detail={`${formatNumber(overview.trendSnapshotCount)} weekly trend snapshots`}
      />
    </div>
  )
}
