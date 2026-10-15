import "server-only"

import { redirect } from "next/navigation"
import { cache } from "react"

import { fail, type ActionFailure } from "@/lib/action-result"
import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/supabase/database.types"

export type UserRole = Database["public"]["Enums"]["user_role"]

export type Viewer = {
  id: string
  email: string
  fullName: string | null
  role: UserRole
}

export const DEMO_READ_ONLY_MESSAGE =
  "Demo mode is read-only — changes are disabled for this account."

/** The signed-in user with their profile, or null. Deduplicated per request. */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub
  if (!userId) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", userId)
    .single()

  if (!profile) return null

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
  }
})

export function hasAdminAccess(viewer: Viewer | null): viewer is Viewer {
  return viewer?.role === "admin" || viewer?.role === "demo"
}

/** Guard for admin-area pages. Admins and the read-only demo role may view. */
export async function requireAdminArea(): Promise<Viewer> {
  const viewer = await getViewer()
  if (!viewer) redirect("/login")
  if (!hasAdminAccess(viewer)) redirect("/?error=forbidden")
  return viewer
}

/** Guard for mutations. Only real admins may write. */
export async function authorizeWrite(): Promise<
  { ok: true; viewer: Viewer } | ActionFailure
> {
  const viewer = await getViewer()
  if (!viewer) return fail("You need to sign in.")
  if (viewer.role === "demo") return fail(DEMO_READ_ONLY_MESSAGE)
  if (viewer.role !== "admin") return fail("You do not have permission.")
  return { ok: true, viewer }
}
