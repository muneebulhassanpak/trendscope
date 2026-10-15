import { z } from "zod"

/* ---------------------------------------------------------------------------
 * List filters (URL search params)
 * ------------------------------------------------------------------------- */

export const ARTICLE_STATUS_FILTERS = {
  all: "All",
  draft: "Draft",
  published: "Published",
} as const

export type ArticleStatusFilter = keyof typeof ARTICLE_STATUS_FILTERS

/** Article list filters. Invalid values fall back to defaults. */
export const articleFiltersSchema = z.object({
  status: z
    .enum(
      Object.keys(ARTICLE_STATUS_FILTERS) as [
        ArticleStatusFilter,
        ...ArticleStatusFilter[],
      ]
    )
    .catch("all"),
  q: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((value) => value || undefined)
    .catch(undefined),
})

export type ArticleFilters = z.infer<typeof articleFiltersSchema>

export function parseArticleFilters(
  params: Record<string, string | string[] | undefined>
): ArticleFilters {
  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value
  return articleFiltersSchema.parse({
    status: first(params.status),
    q: first(params.q),
  })
}

/* ---------------------------------------------------------------------------
 * Editor
 * ------------------------------------------------------------------------- */

export const ARTICLE_LIMITS = {
  titleMin: 5,
  titleMax: 140,
  slugMin: 3,
  slugMax: 80,
  excerptMax: 280,
  bodyMax: 50_000,
  products: 24,
} as const

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const articleIdSchema = z.uuid()

/**
 * URL-safe slug from free text: accents stripped, lowercase kebab-case,
 * capped at the slug limit without a trailing hyphen.
 */
export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, ARTICLE_LIMITS.slugMax)
    .replace(/-+$/, "")
}

/** What the editor's submit button asks for. `save` keeps the current status. */
export const ARTICLE_INTENTS = ["save", "publish", "unpublish"] as const
export type ArticleIntent = (typeof ARTICLE_INTENTS)[number]

export const articleInputSchema = z.object({
  id: articleIdSchema.optional(),
  title: z
    .string()
    .trim()
    .min(
      ARTICLE_LIMITS.titleMin,
      `Use at least ${ARTICLE_LIMITS.titleMin} characters.`
    )
    .max(
      ARTICLE_LIMITS.titleMax,
      `Keep it under ${ARTICLE_LIMITS.titleMax} characters.`
    ),
  slug: z
    .string()
    .trim()
    .min(
      ARTICLE_LIMITS.slugMin,
      `Use at least ${ARTICLE_LIMITS.slugMin} characters.`
    )
    .max(
      ARTICLE_LIMITS.slugMax,
      `Keep it under ${ARTICLE_LIMITS.slugMax} characters.`
    )
    .regex(
      SLUG_PATTERN,
      "Use lowercase letters, numbers and single hyphens only."
    ),
  excerpt: z
    .string()
    .trim()
    .max(
      ARTICLE_LIMITS.excerptMax,
      `Keep it under ${ARTICLE_LIMITS.excerptMax} characters.`
    )
    .transform((value) => value || null),
  body: z.string().max(ARTICLE_LIMITS.bodyMax, "The article body is too long."),
  productIds: z
    .array(z.uuid("Pick products from the list."))
    .max(
      ARTICLE_LIMITS.products,
      `Link at most ${ARTICLE_LIMITS.products} products.`
    )
    .transform((ids) => [...new Set(ids)]),
  intent: z.enum(ARTICLE_INTENTS),
})

export type ArticleInput = z.infer<typeof articleInputSchema>

/** Maps the editor's FormData onto `articleInputSchema`'s shape. */
export function readArticleForm(formData: FormData) {
  return {
    id: formData.get("id") || undefined,
    title: formData.get("title") ?? "",
    slug: formData.get("slug") ?? "",
    excerpt: formData.get("excerpt") ?? "",
    body: formData.get("body") ?? "",
    productIds: formData.getAll("productIds"),
    intent: formData.get("intent"),
  }
}
