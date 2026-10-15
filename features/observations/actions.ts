"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { fail, ok, type ActionResult } from "@/lib/action-result"
import { authorizeWrite } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import {
  observationIdSchema,
  observationInputSchema,
  observationUpdateSchema,
} from "@/features/observations/schemas"

type SupabaseClient = Awaited<ReturnType<typeof createClient>>
type ObservationInput = z.infer<typeof observationInputSchema>

/** Postgres foreign_key_violation: a referenced product or source was deleted. */
const FOREIGN_KEY_VIOLATION = "23503"

function readObservationForm(formData: FormData) {
  return {
    id: formData.get("id"),
    productId: formData.get("productId"),
    note: formData.get("note"),
    tags: formData.getAll("tags"),
    observedAt: formData.get("observedAt"),
    sourceIds: formData.getAll("sourceIds"),
  }
}

function invalid(error: z.ZodError) {
  return fail(
    "Check the highlighted fields.",
    z.flattenError(error).fieldErrors
  )
}

/** Today's observations keep their time of day so they sort above earlier ones. */
function toObservedAt(date: string) {
  const now = new Date()
  return date === now.toISOString().slice(0, 10)
    ? now.toISOString()
    : `${date}T00:00:00.000Z`
}

function toRow(input: ObservationInput) {
  return {
    product_id: input.productId,
    note: input.note,
    tags: input.tags,
    observed_at: toObservedAt(input.observedAt),
  }
}

/**
 * Makes the observation's linked sources exactly `sourceIds`. Missing links are
 * inserted before stale ones are removed, so a failure never drops existing
 * citations silently — the caller reports it.
 */
async function replaceObservationSources(
  supabase: SupabaseClient,
  observationId: string,
  sourceIds: string[]
) {
  if (sourceIds.length) {
    const { error } = await supabase.from("observation_sources").upsert(
      sourceIds.map((sourceId) => ({
        observation_id: observationId,
        source_id: sourceId,
      })),
      { onConflict: "observation_id,source_id", ignoreDuplicates: true }
    )
    if (error) return error
  }

  let stale = supabase
    .from("observation_sources")
    .delete()
    .eq("observation_id", observationId)
  // Ids are validated UUIDs, so they are safe inside the PostgREST list.
  if (sourceIds.length) {
    stale = stale.not("source_id", "in", `(${sourceIds.join(",")})`)
  }
  const { error } = await stale
  return error
}

/** Observations show in the admin list, on product pages and on the dashboard. */
function revalidateObservations() {
  revalidatePath("/admin/observations")
  revalidatePath("/admin/sources")
  revalidatePath("/products/[slug]", "page")
  revalidatePath("/")
}

export async function createObservation(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const auth = await authorizeWrite()
  if (!auth.ok) return auth

  const parsed = observationInputSchema.safeParse(readObservationForm(formData))
  if (!parsed.success) return invalid(parsed.error)

  const supabase = await createClient()
  const { data: observation, error } = await supabase
    .from("observations")
    .insert({ ...toRow(parsed.data), author_id: auth.viewer.id })
    .select("id")
    .single()
  if (error?.code === FOREIGN_KEY_VIOLATION) {
    return fail("Check the highlighted fields.", {
      productId: ["This product no longer exists."],
    })
  }
  if (error) {
    console.error("createObservation failed", error)
    return fail("Could not save the observation. Try again.")
  }

  const linkError = await replaceObservationSources(
    supabase,
    observation.id,
    parsed.data.sourceIds
  )
  if (linkError) {
    // Roll back so a half-saved observation never appears without its sources.
    await supabase.from("observations").delete().eq("id", observation.id)
    console.error("createObservation source links failed", linkError)
    return linkError.code === FOREIGN_KEY_VIOLATION
      ? fail("Check the highlighted fields.", {
          sourceIds: ["A selected source no longer exists."],
        })
      : fail("Could not link the sources, so nothing was saved. Try again.")
  }

  revalidateObservations()
  return ok(undefined, "Observation added")
}

export async function updateObservation(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const auth = await authorizeWrite()
  if (!auth.ok) return auth

  const parsed = observationUpdateSchema.safeParse(
    readObservationForm(formData)
  )
  if (!parsed.success) return invalid(parsed.error)

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("observations")
    .update(toRow(parsed.data))
    .eq("id", parsed.data.id)
    .select("id")
  if (error?.code === FOREIGN_KEY_VIOLATION) {
    return fail("Check the highlighted fields.", {
      productId: ["This product no longer exists."],
    })
  }
  if (error) {
    console.error("updateObservation failed", error)
    return fail("Could not save the observation. Try again.")
  }
  if (!data.length) return fail("This observation no longer exists.")

  const linkError = await replaceObservationSources(
    supabase,
    parsed.data.id,
    parsed.data.sourceIds
  )
  if (linkError) {
    console.error("updateObservation source links failed", linkError)
    revalidateObservations()
    return linkError.code === FOREIGN_KEY_VIOLATION
      ? fail("The note was saved, but a selected source no longer exists.", {
          sourceIds: ["A selected source no longer exists."],
        })
      : fail("The note was saved, but its sources could not be updated.")
  }

  revalidateObservations()
  return ok(undefined, "Observation updated")
}

export async function deleteObservation(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const auth = await authorizeWrite()
  if (!auth.ok) return auth

  const parsed = observationIdSchema.safeParse({ id: formData.get("id") })
  if (!parsed.success) return fail("Unknown observation.")

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("observations")
    .delete()
    .eq("id", parsed.data.id)
    .select("id")
  if (error) {
    console.error("deleteObservation failed", error)
    return fail("Could not delete the observation. Try again.")
  }
  if (!data.length) return fail("This observation no longer exists.")

  revalidateObservations()
  return ok(undefined, "Observation deleted")
}
