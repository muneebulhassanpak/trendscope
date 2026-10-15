"use server"

import { revalidatePath } from "next/cache"

import { fail, ok, type ActionResult } from "@/lib/action-result"
import { authorizeWrite } from "@/lib/auth"
import { runMarketSync, type SyncSummary } from "@/lib/market-data/sync"
import { createAdminClient } from "@/lib/supabase/admin"

/** Pages that render synced market data. */
const SYNCED_PATHS = [
  "/admin/sync",
  "/",
  "/products",
  "/trends",
  "/rankings",
  "/compare",
]

/**
 * Runs the market data sync on demand. Takes no input: the trigger is fixed
 * server-side. Uses the secret-key client because the sync job itself writes
 * catalog, price and snapshot tables (the one sanctioned use, see CONTRIBUTING).
 */
export async function runSyncNow(): Promise<ActionResult<SyncSummary>> {
  const auth = await authorizeWrite()
  if (!auth.ok) return auth

  let summary: SyncSummary
  try {
    summary = await runMarketSync(createAdminClient(), { trigger: "manual" })
  } catch (error) {
    // Details stay server-side (and in sync_logs.error for admins).
    console.error("Manual market sync failed", error)
    revalidatePath("/admin/sync")
    return fail("The sync failed. See the run history for details.")
  }

  if (summary.status === "success") {
    for (const path of SYNCED_PATHS) revalidatePath(path)
    revalidatePath("/products/[slug]", "page")
  }
  return ok(summary)
}
