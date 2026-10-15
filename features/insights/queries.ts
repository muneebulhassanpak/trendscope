import "server-only"

import { cache } from "react"

import { createClient } from "@/lib/supabase/server"
import { readingMinutes } from "@/features/insights/reading-time"
import type {
  ArticleProduct,
  ArticleSummary,
  PublishedArticle,
} from "@/features/insights/types"

/*
 * Public pages filter on `status = 'published'` explicitly: RLS lets admin and
 * demo users read drafts, and drafts must never reach a public page.
 */

export async function listPublishedArticles(): Promise<ArticleSummary[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("articles")
    .select(
      "id, title, slug, excerpt, body, published_at, article_products(products(name, slug))"
    )
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
  if (error) throw error

  return data.map(({ body, article_products, ...article }) => ({
    ...article,
    readingMinutes: readingMinutes(body),
    products: article_products
      .map((link) => link.products)
      .sort((a, b) => a.name.localeCompare(b.name)),
  }))
}

export const getPublishedArticle = cache(
  async (slug: string): Promise<PublishedArticle | null> => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("articles")
      .select("id, title, slug, excerpt, body, published_at")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()
    if (error) throw error
    return data && { ...data, readingMinutes: readingMinutes(data.body) }
  }
)

export async function listArticleProducts(
  articleId: string
): Promise<ArticleProduct[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("article_products")
    .select(
      "product_overview(id, name, slug, brand_name, category_name, color, latest_price, change_30d_pct)"
    )
    .eq("article_id", articleId)
  if (error) throw error

  return data
    .map((link) => link.product_overview)
    .filter((product): product is ArticleProduct => product !== null)
    .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""))
}
