"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { fail, ok, type ActionResult } from "@/lib/action-result"
import { authorizeWrite } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import {
  updateProfileSchema,
  updateUserRoleSchema,
  USER_ROLES,
} from "@/features/settings/schemas"

/** Updates the signed-in admin's display name. The target is always the session user. */
export async function updateProfile(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const auth = await authorizeWrite()
  if (!auth.ok) return auth

  const parsed = updateProfileSchema.safeParse({
    fullName: formData.get("fullName"),
  })
  if (!parsed.success) {
    return fail(
      "Check the highlighted fields.",
      z.flattenError(parsed.error).fieldErrors
    )
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName })
    .eq("id", auth.viewer.id)
  if (error) {
    console.error("Profile update failed", error)
    return fail("Could not save your profile. Please try again.")
  }

  // The name also appears in the sidebar user menu on every page.
  revalidatePath("/", "layout")
  return ok(undefined, "Profile saved.")
}

/** Changes another user's role. Admins cannot change their own (prevents lockout). */
export async function updateUserRole(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const auth = await authorizeWrite()
  if (!auth.ok) return auth

  const parsed = updateUserRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  })
  if (!parsed.success) {
    return fail(
      "Invalid role change.",
      z.flattenError(parsed.error).fieldErrors
    )
  }

  const { userId, role } = parsed.data
  if (userId === auth.viewer.id) {
    return fail("You can't change your own role. Ask another admin.")
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId)
    .select("email")
  if (error) {
    console.error("Role update failed", error)
    return fail("Could not update the role. Please try again.")
  }
  if (!data.length) return fail("That user no longer exists.")

  revalidatePath("/settings")
  return ok(undefined, `${data[0]!.email} is now ${USER_ROLES[role].label}.`)
}
