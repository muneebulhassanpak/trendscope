import type { Enums, Tables } from "@/lib/supabase/database.types"

export type SyncLog = Tables<"sync_logs">

export type SyncStatus = Enums<"sync_status">

export type SyncOverview = {
  /** Machine name of the configured market data provider, e.g. "demo". */
  provider: string
  lastSuccess: Pick<
    SyncLog,
    "started_at" | "finished_at" | "records_updated"
  > | null
  productCount: number
  pricePointCount: number
  trendSnapshotCount: number
}
