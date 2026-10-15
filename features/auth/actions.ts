"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { fail, type ActionResult } from "@/lib/action-result"
import { serverEnv } from "@/lib/env.server"
import { safeRedirectPath } from "@/lib/safe-redirect"
import { createClient } from "@/lib/supabase/server"
import { signInSchema } from "@/features/auth/schemas"

export async function signIn(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return fail(
      "Check the highlighted fields.",
      z.flattenError(parsed.error).fieldErrors
    )
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })
  // Generic message: do not reveal whether the account exists.
  if (error) return fail("Invalid email or password.")

  revalidatePath("/", "layout")
  redirect(safeRedirectPath(parsed.data.next, "/admin/observations"))
}

export async function signInAsDemo(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const { DEMO_USER_EMAIL, DEMO_USER_PASSWORD } = serverEnv
  if (!DEMO_USER_EMAIL || !DEMO_USER_PASSWORD) {
    return fail("Demo access is not configured.")
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: DEMO_USER_EMAIL,
    password: DEMO_USER_PASSWORD,
  })
  if (error) return fail("Demo access is temporarily unavailable.")

  revalidatePath("/", "layout")
  redirect(safeRedirectPath(formData.get("next"), "/admin/observations"))
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/")
}
