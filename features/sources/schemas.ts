import { z } from "zod"

import { Constants } from "@/lib/supabase/database.types"
import type { SourceType } from "@/features/sources/types"

export const SOURCE_TYPES = Constants.public.Enums.source_type

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  article: "Article",
  report: "Report",
  social: "Social",
  other: "Other",
}

export const SOURCE_TITLE_MIN = 3
export const SOURCE_TITLE_MAX = 160
export const SOURCE_URL_MAX = 2048
export const SOURCES_PAGE_SIZE = 20

/** Create / edit form. URLs must be absolute http(s) links to a real domain. */
export const sourceInputSchema = z.object({
  title: z
    .string({ error: "Enter a title." })
    .trim()
    .min(SOURCE_TITLE_MIN, `Use at least ${SOURCE_TITLE_MIN} characters.`)
    .max(SOURCE_TITLE_MAX, `Use at most ${SOURCE_TITLE_MAX} characters.`),
  url: z
    .string({ error: "Enter a URL." })
    .trim()
    .max(SOURCE_URL_MAX, "This URL is too long.")
    .pipe(
      z.url({
        protocol: /^https?$/,
        hostname: z.regexes.domain,
        error: "Enter a full link starting with http:// or https://.",
      })
    ),
  type: z.enum(SOURCE_TYPES, { error: "Choose a source type." }),
})

export const sourceUpdateSchema = sourceInputSchema.extend({
  id: z.uuid({ error: "Unknown source." }),
})

export const sourceIdSchema = z.object({
  id: z.uuid({ error: "Unknown source." }),
})

/** Source list filters from URL search params. Invalid values fall back to defaults. */
export const sourceFiltersSchema = z.object({
  q: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((value) => value || undefined)
    .catch(undefined),
  type: z.enum(SOURCE_TYPES).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
})

export type SourceFilters = z.infer<typeof sourceFiltersSchema>

export function parseSourceFilters(
  params: Record<string, string | string[] | undefined>
): SourceFilters {
  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value
  return sourceFiltersSchema.parse({
    q: first(params.q),
    type: first(params.type),
    page: first(params.page),
  })
}
