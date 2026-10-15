import type { Metadata } from "next"

import { PageHeader } from "@/components/shared/page-header"
import { RunSyncButton } from "@/features/sync/components/run-sync-button"
import { SyncHistory } from "@/features/sync/components/sync-history"
import { SyncPipeline } from "@/features/sync/components/sync-pipeline"
import { SyncStats } from "@/features/sync/components/sync-stats"
import {
  getSyncOverview,
  listSyncLogs,
  SYNC_HISTORY_LIMIT,
} from "@/features/sync/queries"

export const metadata: Metadata = { title: "Data Sync" }

// Applies to the "Run sync now" action: a first sync backfills a year of
// prices, so give it the same budget as the cron route.
export const maxDuration = 60

export default async function DataSyncPage() {
  const [overview, logs] = await Promise.all([
    getSyncOverview(),
    listSyncLogs(),
  ])

  return (
    <>
      <PageHeader
        title="Data Sync"
        description="Market data pulled from the provider API into the catalog, price history and trend scores."
        actions={<RunSyncButton />}
      />

      <SyncStats overview={overview} />

      <SyncPipeline overview={overview} />

      <section aria-labelledby="sync-history" className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 id="sync-history" className="font-medium">
            Sync history
          </h2>
          <p className="text-sm text-muted-foreground">
            Latest {SYNC_HISTORY_LIMIT} runs, newest first.
          </p>
        </div>
        <SyncHistory logs={logs} />
      </section>
    </>
  )
}
