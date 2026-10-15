import "server-only"

import { getMarketDataProvider } from "@/lib/market-data/sync"
import { createClient } from "@/lib/supabase/server"
import type { SyncLog, SyncOverview } from "@/features/sync/types"

export const SYNC_HISTORY_LIMIT = 50

/** Most recent sync runs, newest first. RLS limits this to the admin area. */
export async function listSyncLogs(): Promise<SyncLog[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("sync_logs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(SYNC_HISTORY_LIMIT)
  if (error) throw error
  return data
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
