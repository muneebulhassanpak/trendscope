"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { fail, ok, type ActionResult } from "@/lib/action-result"
import { authorizeWrite } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import {
  articleIdSchema,
  articleInputSchema,
  readArticleForm,
  type ArticleIntent,
} from "@/features/articles/schemas"
import type { ArticleStatus, SavedArticle } from "@/features/articles/types"

type Supabase = Awaited<ReturnType<typeof createClient>>

type Publication = { status: ArticleStatus; published_at: string | null }

type ArticleSnapshot = Publication & {
  slug: string
  body: string
  productSlugs: string[]
}

const UNIQUE_VIOLATION = "23505"
const SAVE_FAILED = "Could not save the article. Try again."
const NOT_FOUND = "This article no longer exists."
const NEEDS_BODY = "Write the article before publishing it."

/* ---------------------------------------------------------------------------
 * Actions
 * ------------------------------------------------------------------------- */

/** Creates or updates an article and replaces its product links. */
export async function saveArticle(
  _prev: ActionResult<SavedArticle> | null,
  formData: FormData
): Promise<ActionResult<SavedArticle>> {
  const auth = await authorizeWrite()
  if (!auth.ok) return auth

  const parsed = articleInputSchema.safeParse(readArticleForm(formData))
  if (!parsed.success) {
    return fail(
      "Check the highlighted fields.",
      z.flattenError(parsed.error).fieldErrors
    )
  }
  const { id, intent, productIds, ...fields } = parsed.data
  const supabase = await createClient()

  let current: ArticleSnapshot | null = null
  if (id) {
    const snapshot = await getSnapshot(supabase, id)
    if (snapshot === "error") return fail(SAVE_FAILED)
    if (!snapshot) return fail(NOT_FOUND)
    current = snapshot
  }

  const publication = resolvePublication(current, intent)
  if (publication.status === "published" && !fields.body.trim()) {
    return fail(NEEDS_BODY, { body: [NEEDS_BODY] })
  }

  // Validate everything before the first write so a rejected save changes nothing.
  const products = await getProducts(supabase, productIds)
  if (products === "error") return fail(SAVE_FAILED)
  if (products.length !== productIds.length) {
    return fail("Check the highlighted fields.", {
      productIds: ["Some selected products no longer exist."],
    })
  }

  let clashQuery = supabase
    .from("articles")
    .select("id")
    .eq("slug", fields.slug)
    .limit(1)
  if (id) clashQuery = clashQuery.neq("id", id)
  const { data: clash, error: clashError } = await clashQuery
  if (clashError) return fail(SAVE_FAILED)
  if (clash.length) return slugTaken()

  const row = { ...fields, ...publication }
  const { data: saved, error } = id
    ? await supabase
        .from("articles")
        .update(row)
        .eq("id", id)
        .select("id")
        .maybeSingle()
    : await supabase
        .from("articles")
        .insert({ ...row, author_id: auth.viewer.id })
        .select("id")
        .single()
  // The unique index still guards against a concurrent save taking the slug.
  if (error)
    return error.code === UNIQUE_VIOLATION ? slugTaken() : fail(SAVE_FAILED)
  if (!saved) return fail(NOT_FOUND)

  const linked = await replaceProductLinks(supabase, saved.id, productIds)
  if (!linked) {
    if (!id) {
      // Roll back the new article rather than leave it half-created.
      await supabase.from("articles").delete().eq("id", saved.id)
      return fail("Could not link the selected products, so nothing was saved.")
    }
    revalidateArticle(
      saved.id,
      [current?.slug, fields.slug],
      current?.productSlugs ?? []
    )
    return fail(
      "The article was saved, but its linked products could not be updated. Save again to retry."
    )
  }

  revalidateArticle(
    saved.id,
    [current?.slug, fields.slug],
    [...(current?.productSlugs ?? []), ...products.map((p) => p.slug)]
  )

  return ok(
    { id: saved.id, ...fields, ...publication, productIds },
    saveMessage(current, publication, intent)
  )
}

export async function publishArticle(id: string): Promise<ActionResult> {
  return changePublication(id, "publish")
}

export async function unpublishArticle(id: string): Promise<ActionResult> {
  return changePublication(id, "unpublish")
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  const auth = await authorizeWrite()
  if (!auth.ok) return auth

  const parsedId = articleIdSchema.safeParse(id)
  if (!parsedId.success) return fail(NOT_FOUND)

  const supabase = await createClient()
  const snapshot = await getSnapshot(supabase, parsedId.data)
  if (snapshot === "error")
    return fail("Could not delete the article. Try again.")
  if (!snapshot) return fail(NOT_FOUND)

  // Product links cascade with the article.
  const { data, error } = await supabase
    .from("articles")
    .delete()
    .eq("id", parsedId.data)
    .select("id")
  if (error) return fail("Could not delete the article. Try again.")
  if (!data.length) return fail(NOT_FOUND)

  revalidateArticle(parsedId.data, [snapshot.slug], snapshot.productSlugs)
  return ok(undefined, "Article deleted.")
}

/* ---------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------- */

async function changePublication(
  id: string,
  intent: Exclude<ArticleIntent, "save">
): Promise<ActionResult> {
  const auth = await authorizeWrite()
  if (!auth.ok) return auth

  const parsedId = articleIdSchema.safeParse(id)
  if (!parsedId.success) return fail(NOT_FOUND)

  const supabase = await createClient()
  const current = await getSnapshot(supabase, parsedId.data)
  if (current === "error") return fail(SAVE_FAILED)
  if (!current) return fail(NOT_FOUND)

  const publication = resolvePublication(current, intent)
  if (publication.status === "published" && !current.body.trim()) {
    return fail(NEEDS_BODY)
  }

  const { data, error } = await supabase
    .from("articles")
    .update(publication)
    .eq("id", parsedId.data)
    .select("id")
    .maybeSingle()
  if (error) return fail(SAVE_FAILED)
  if (!data) return fail(NOT_FOUND)

  revalidateArticle(parsedId.data, [current.slug], current.productSlugs)
  return ok(
    undefined,
    intent === "publish" ? "Article published." : "Article moved to drafts."
  )
}

/** Publishing stamps `published_at` the first time; unpublishing clears it. */
function resolvePublication(
  current: Publication | null,
  intent: ArticleIntent
): Publication {
  switch (intent) {
    case "publish":
      return current?.status === "published"
        ? { status: "published", published_at: current.published_at }
        : { status: "published", published_at: new Date().toISOString() }
    case "unpublish":
      return { status: "draft", published_at: null }
    case "save":
      return current
        ? { status: current.status, published_at: current.published_at }
        : { status: "draft", published_at: null }
  }
}

function saveMessage(
  current: Publication | null,
  next: Publication,
  intent: ArticleIntent
) {
  if (intent === "publish" && current?.status !== "published") {
    return "Article published."
  }
  if (intent === "unpublish") return "Article moved to drafts."
  if (!current) return "Draft created."
  return next.status === "published" ? "Changes published." : "Draft saved."
}

function slugTaken() {
  return fail("Check the highlighted fields.", {
    slug: ["Another article already uses this slug."],
  })
}

async function getSnapshot(
  supabase: Supabase,
  id: string
): Promise<ArticleSnapshot | null | "error"> {
  const { data, error } = await supabase
    .from("articles")
    .select(
      "slug, status, published_at, body, article_products(products(slug))"
    )
    .eq("id", id)
    .maybeSingle()
  if (error) return "error"
  if (!data) return null

  const { article_products, ...article } = data
  return {
    ...article,
    productSlugs: article_products.map((link) => link.products.slug),
  }
}

async function getProducts(supabase: Supabase, ids: string[]) {
  if (!ids.length) return []
  const { data, error } = await supabase
    .from("products")
    .select("id, slug")
    .in("id", ids)
  return error ? "error" : data
}

/**
 * Makes the article's links exactly `productIds`: adds missing links, then
 * removes the rest. Independent of any earlier read, so concurrent edits
 * cannot leave stale links behind. Returns false if either step failed.
 */
async function replaceProductLinks(
  supabase: Supabase,
  articleId: string,
  productIds: string[]
) {
  if (productIds.length) {
    const { error } = await supabase.from("article_products").upsert(
      productIds.map((productId) => ({
        article_id: articleId,
        product_id: productId,
      })),
      { onConflict: "article_id,product_id", ignoreDuplicates: true }
    )
    if (error) return false
  }

  let stale = supabase
    .from("article_products")
    .delete()
    .eq("article_id", articleId)
  // Ids are validated UUIDs, so the list needs no further escaping.
  if (productIds.length) {
    stale = stale.not("product_id", "in", `(${productIds.join(",")})`)
  }
  const { error } = await stale
  return !error
}

function revalidateArticle(
  id: string,
  slugs: (string | undefined)[],
  productSlugs: string[]
) {
  revalidatePath("/admin/articles")
  revalidatePath(`/admin/articles/${id}/edit`)
  revalidatePath("/insights")
  for (const slug of new Set(slugs)) {
    if (slug) revalidatePath(`/insights/${slug}`)
  }
  revalidatePath("/")
  for (const slug of new Set(productSlugs)) revalidatePath(`/products/${slug}`)
}
