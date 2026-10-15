import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/features/settings/types"

/**
 * All user profiles, oldest first. RLS returns every row only to admins
 * (other roles get just their own), and the page calls this for admins only.
 */
export async function listProfiles(): Promise<Profile[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: true })
  if (error) throw error
  return data
}
