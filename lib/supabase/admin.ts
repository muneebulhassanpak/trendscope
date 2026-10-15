import "server-only"

import { createClient } from "@supabase/supabase-js"

import { publicEnv } from "@/lib/env"
import { serverEnv } from "@/lib/env.server"
import type { Database } from "@/lib/supabase/database.types"

/**
 * Privileged client using the secret key. Bypasses RLS — only for trusted
 * server jobs (market data sync). Never use it to serve user requests.
 */
export function createAdminClient() {
  if (!serverEnv.SUPABASE_SECRET_KEY) {
    throw new Error("SUPABASE_SECRET_KEY is not configured")
  }

  return createClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SECRET_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
