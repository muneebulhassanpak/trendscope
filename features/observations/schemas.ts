import { z } from "zod"

export const NOTE_MIN = 10
export const NOTE_MAX = 1000
export const MAX_TAGS = 8
export const TAG_MAX_LENGTH = 24
export const MAX_SOURCES_PER_OBSERVATION = 20
export const OBSERVATIONS_PAGE_SIZE = 20
const EARLIEST_OBSERVED_DATE = "2000-01-01"

/** Lowercase, slug-like: "sell-out", "grey-market". */
const TAG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const SLUG_PATTERN = /^[a-z0-9-]{1,80}$/

/** Turns free text into a tag ("Grey Market!" → "grey-market"); "" when nothing is left. */
export function normalizeTag(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .slice(0, TAG_MAX_LENGTH)
    .replace(/^-+|-+$/g, "")
}

/**
 * The latest calendar date that is "today" somewhere on Earth (UTC+14), so an
 * admin ahead of UTC can still pick their local today.
 */
function latestValidDate() {
  return new Date(Date.now() + 14 * 3_600_000).toISOString().slice(0, 10)
}

const tagSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(TAG_MAX_LENGTH, `Tags are at most ${TAG_MAX_LENGTH} characters.`)
  .regex(TAG_PATTERN, "Tags use lowercase letters, numbers and dashes.")

const uniq = <T>(values: T[]) => [...new Set(values)]

/** Create / edit form. Ids come from the client, so they are validated as UUIDs. */
export const observationInputSchema = z.object({
  productId: z.uuid({ error: "Choose a product." }),
  note: z
    .string({ error: "Write a note." })
    .trim()
    .min(NOTE_MIN, `Write at least ${NOTE_MIN} characters.`)
    .max(NOTE_MAX, `Keep it under ${NOTE_MAX} characters.`),
  tags: z
    .array(tagSchema)
    .max(MAX_TAGS, `Use at most ${MAX_TAGS} tags.`)
    .transform(uniq),
  observedAt: z.iso
    .date({ error: "Pick a valid date." })
    .refine(
      (date) => date >= EARLIEST_OBSERVED_DATE,
      "Pick a date after the year 2000."
    )
    .refine(
      (date) => date <= latestValidDate(),
      "The date cannot be in the future."
    ),
  sourceIds: z
    .array(z.uuid({ error: "Unknown source." }))
    .max(
      MAX_SOURCES_PER_OBSERVATION,
      `Link at most ${MAX_SOURCES_PER_OBSERVATION} sources.`
    )
    .transform(uniq),
})

export const observationUpdateSchema = observationInputSchema.extend({
  id: z.uuid({ error: "Unknown observation." }),
})

export const observationIdSchema = z.object({
  id: z.uuid({ error: "Unknown observation." }),
})

/** Observation list filters from URL search params. Invalid values fall back to defaults. */
export const observationFiltersSchema = z.object({
  q: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((value) => value || undefined)
    .catch(undefined),
  product: z.string().regex(SLUG_PATTERN).optional().catch(undefined),
  tag: z
    .string()
    .max(TAG_MAX_LENGTH)
    .regex(TAG_PATTERN)
    .optional()
    .catch(undefined),
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
})

export type ObservationFilters = z.infer<typeof observationFiltersSchema>

export function parseObservationFilters(
  params: Record<string, string | string[] | undefined>
): ObservationFilters {
  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value
  return observationFiltersSchema.parse({
    q: first(params.q),
    product: first(params.product),
    tag: first(params.tag),
    page: first(params.page),
  })
}
