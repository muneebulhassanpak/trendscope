import { createClient } from "@supabase/supabase-js"

import type { Database } from "@/lib/supabase/database.types"
import { requireEnv } from "./env"

export function createScriptAdminClient() {
  return createClient<Database>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SECRET_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
