import { createClient } from "@supabase/supabase-js"

import type { Database } from "../../lib/supabase/database.types"

/** A marker unique to one test run, so rows created by tests are easy to find. */
export function uniqueMarker() {
  return `e2e-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

/**
 * Removes rows a test created (matched by its marker) even when the test
 * failed half-way. The local database is shared, so tests clean up after
 * themselves. Uses the secret key — test fixtures only, never app code.
 */
export async function deleteTestRows(marker: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY
  if (!url || !key) return

  const db = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  await Promise.all([
    db.from("observations").delete().ilike("note", `%${marker}%`),
    db.from("sources").delete().ilike("title", `%${marker}%`),
  ])
}
