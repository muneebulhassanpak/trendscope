"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { fail, ok, type ActionResult } from "@/lib/action-result"
import { authorizeWrite } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import {
  sourceIdSchema,
  sourceInputSchema,
  sourceUpdateSchema,
} from "@/features/sources/schemas"

function readSourceForm(formData: FormData) {
  return {
    id: formData.get("id"),
    title: formData.get("title"),
    url: formData.get("url"),
    type: formData.get("type"),
  }
}

function invalid(error: z.ZodError) {
  return fail(
    "Check the highlighted fields.",
    z.flattenError(error).fieldErrors
  )
}

/** Sources appear in the admin lists and next to observations on product pages. */
function revalidateSources() {
  revalidatePath("/admin/sources")
  revalidatePath("/admin/observations")
  revalidatePath("/products/[slug]", "page")
}

export async function createSource(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const auth = await authorizeWrite()
  if (!auth.ok) return auth

  const parsed = sourceInputSchema.safeParse(readSourceForm(formData))
  if (!parsed.success) return invalid(parsed.error)

  const supabase = await createClient()
  const { error } = await supabase
    .from("sources")
    .insert({ ...parsed.data, created_by: auth.viewer.id })
  if (error) {
    console.error("createSource failed", error)
    return fail("Could not add the source. Try again.")
  }

  revalidateSources()
  return ok(undefined, "Source added")
}

export async function updateSource(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const auth = await authorizeWrite()
  if (!auth.ok) return auth

  const parsed = sourceUpdateSchema.safeParse(readSourceForm(formData))
  if (!parsed.success) return invalid(parsed.error)

  const { id, ...values } = parsed.data
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("sources")
    .update(values)
    .eq("id", id)
    .select("id")
  if (error) {
    console.error("updateSource failed", error)
    return fail("Could not save the source. Try again.")
  }
  if (!data.length) return fail("This source no longer exists.")

  revalidateSources()
  return ok(undefined, "Source updated")
}

/** Deleting a source also removes its links to observations (FK cascade). */
export async function deleteSource(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const auth = await authorizeWrite()
  if (!auth.ok) return auth

  const parsed = sourceIdSchema.safeParse({ id: formData.get("id") })
  if (!parsed.success) return fail("Unknown source.")

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("sources")
    .delete()
    .eq("id", parsed.data.id)
    .select("id")
  if (error) {
    console.error("deleteSource failed", error)
    return fail("Could not delete the source. Try again.")
  }
  if (!data.length) return fail("This source no longer exists.")

  revalidateSources()
  return ok(undefined, "Source deleted")
}
