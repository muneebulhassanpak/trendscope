import "server-only"

import { getViewer } from "@/lib/auth"
import { getMarketDataProvider } from "@/lib/market-data/sync"
import { createClient } from "@/lib/supabase/server"
import type { SyncLog, SyncOverview } from "@/features/sync/types"

export const SYNC_HISTORY_LIMIT = 50

const SYNC_LOG_COLUMNS =
  "id, started_at, finished_at, status, records_updated, provider, trigger"

/**
 * Most recent sync runs, newest first. RLS limits this to the admin area.
 * Error text is column-restricted in the database and only returned to
 * admins (via get_sync_log_errors); the demo role sees that a run failed.
 */
export async function listSyncLogs(): Promise<SyncLog[]> {
  const supabase = await createClient()
  const [{ data, error }, viewer] = await Promise.all([
    supabase
      .from("sync_logs")
      .select(SYNC_LOG_COLUMNS)
      .order("started_at", { ascending: false })
      .limit(SYNC_HISTORY_LIMIT),
    getViewer(),
  ])
  if (error) throw error

  const errors = new Map<number, string>()
  const failedIds = data
    .filter((log) => log.status === "failed")
    .map((log) => log.id)
  if (viewer?.role === "admin" && failedIds.length) {
    const { data: rows, error: rpcError } = await supabase.rpc(
      "get_sync_log_errors",
      { log_ids: failedIds }
    )
    if (rpcError) throw rpcError
    for (const row of rows) errors.set(row.id, row.error)
  }

  return data.map((log) => ({ ...log, error: errors.get(log.id) ?? null }))
}

export async function getSyncOverview(): Promise<SyncOverview> {
  const supabase = await createClient()
  const countOnly = { count: "exact", head: true } as const

  const [lastSuccess, products, pricePoints, trendSnapshots] =
    await Promise.all([
      supabase
        .from("sync_logs")
        .select("started_at, finished_at, records_updated")
        .eq("status", "success")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("products").select("id", countOnly),
      supabase.from("price_history").select("id", countOnly),
      supabase.from("trend_snapshots").select("id", countOnly),
    ])

  for (const { error } of [
    lastSuccess,
    products,
    pricePoints,
    trendSnapshots,
  ]) {
    if (error) throw error
  }

  return {
    provider: getMarketDataProvider().name,
    lastSuccess: lastSuccess.data,
    productCount: products.count ?? 0,
    pricePointCount: pricePoints.count ?? 0,
    trendSnapshotCount: trendSnapshots.count ?? 0,
  }
}
