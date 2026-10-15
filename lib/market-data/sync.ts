import type { SupabaseClient } from "@supabase/supabase-js"

import { addDays, todayUtc } from "@/lib/market-data/dates"
import { DemoMarketDataProvider } from "@/lib/market-data/providers/demo"
import type { MarketDataProvider } from "@/lib/market-data/types"
import type { Database } from "@/lib/supabase/database.types"

export type SyncTrigger =
  Database["public"]["Tables"]["sync_logs"]["Row"]["trigger"]

export type SyncSummary = {
  status: "success" | "skipped"
  products: number
  pricePoints: number
  trendSnapshots: number
}

const BACKFILL_DAYS = 365
const INSERT_BATCH = 1000
const STALE_RUN_MINUTES = 10

export function getMarketDataProvider(): MarketDataProvider {
  return new DemoMarketDataProvider()
}

/**
 * Pulls the catalog and any missing daily prices from the provider, then
 * recomputes trend snapshots. Idempotent: safe to run repeatedly.
 * Requires a client created with the secret key (bypasses RLS).
 */
export async function runMarketSync(
  db: SupabaseClient<Database>,
  {
    trigger,
    provider = getMarketDataProvider(),
    today = todayUtc(),
  }: { trigger: SyncTrigger; provider?: MarketDataProvider; today?: string }
): Promise<SyncSummary> {
  const staleBefore = new Date(
    Date.now() - STALE_RUN_MINUTES * 60_000
  ).toISOString()
  const { data: running } = await db
    .from("sync_logs")
    .select("id")
    .eq("status", "running")
    .gt("started_at", staleBefore)
    .limit(1)

  if (running?.length) {
    return { status: "skipped", products: 0, pricePoints: 0, trendSnapshots: 0 }
  }

  const { data: log, error: logError } = await db
    .from("sync_logs")
    .insert({ trigger, provider: provider.name })
    .select("id")
    .single()
  if (logError) throw logError

  try {
    const catalog = await provider.getCatalog()
    const productIds = await upsertCatalog(db, catalog)

    const { data: latest, error: latestError } = await db
      .from("product_overview")
      .select("id, latest_recorded_on")
    if (latestError) throw latestError
    const latestById = new Map(
      latest.map((row) => [row.id, row.latest_recorded_on])
    )

    let pricePoints = 0
    for (const product of catalog) {
      const productId = productIds.get(product.externalId)
      if (!productId) continue

      const last = latestById.get(productId)
      const from = last ? addDays(last, 1) : addDays(today, -BACKFILL_DAYS)
      if (from > today) continue

      const points = await provider.getPriceHistory(product, from, today)
      const rows = points.map((point) => ({
        product_id: productId,
        price: point.price,
        recorded_on: point.date,
        source: provider.name,
      }))

      for (let i = 0; i < rows.length; i += INSERT_BATCH) {
        const { error } = await db
          .from("price_history")
          .upsert(rows.slice(i, i + INSERT_BATCH), {
            onConflict: "product_id,recorded_on,source",
            ignoreDuplicates: true,
          })
        if (error) throw error
      }
      pricePoints += rows.length
    }

    const { data: trendSnapshots, error: trendError } = await db.rpc(
      "refresh_trend_snapshots",
      { weeks: 26 }
    )
    if (trendError) throw trendError

    await db
      .from("sync_logs")
      .update({
        status: "success",
        finished_at: new Date().toISOString(),
        records_updated: pricePoints,
      })
      .eq("id", log.id)

    return {
      status: "success",
      products: catalog.length,
      pricePoints,
      trendSnapshots: trendSnapshots ?? 0,
    }
  } catch (error) {
    await db
      .from("sync_logs")
      .update({
        status: "failed",
        finished_at: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      })
      .eq("id", log.id)
    throw error
  }
}

async function upsertCatalog(
  db: SupabaseClient<Database>,
  catalog: Awaited<ReturnType<MarketDataProvider["getCatalog"]>>
) {
  const brands = uniqueBy(
    catalog.map((p) => p.brand),
    (b) => b.slug
  )
  const categories = uniqueBy(
    catalog.map((p) => p.category),
    (c) => c.slug
  )

  const { data: brandRows, error: brandError } = await db
    .from("brands")
    .upsert(brands, { onConflict: "slug" })
    .select("id, slug")
  if (brandError) throw brandError

  const { data: categoryRows, error: categoryError } = await db
    .from("categories")
    .upsert(categories, { onConflict: "slug" })
    .select("id, slug")
  if (categoryError) throw categoryError

  const brandIds = new Map(brandRows.map((b) => [b.slug, b.id]))
  const categoryIds = new Map(categoryRows.map((c) => [c.slug, c.id]))

  const { data: productRows, error: productError } = await db
    .from("products")
    .upsert(
      catalog.map((p) => ({
        external_id: p.externalId,
        name: p.name,
        slug: p.slug,
        description: p.description,
        brand_id: brandIds.get(p.brand.slug)!,
        category_id: categoryIds.get(p.category.slug)!,
        color: p.color,
        material: p.material,
        retail_price: p.retailPrice,
        release_date: p.releaseDate,
      })),
      { onConflict: "external_id" }
    )
    .select("id, external_id")
  if (productError) throw productError

  return new Map(productRows.map((p) => [p.external_id!, p.id]))
}

function uniqueBy<T>(items: T[], key: (item: T) => string) {
  return [...new Map(items.map((item) => [key(item), item])).values()]
}
