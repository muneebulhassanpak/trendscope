import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { ArticleFilters } from "@/features/articles/schemas"
import type {
  ArticleList,
  ArticleProductOption,
  EditableArticle,
} from "@/features/articles/types"

/** Escapes LIKE wildcards so a search term matches literally. */
function likePattern(term: string) {
  return `%${term.replace(/[\\%_]/g, "\\$&")}%`
}

/**
 * Articles for the admin list, most recently edited first. The search runs in
 * the database; the status filter is applied here so the tab counts reflect
 * the same search (the editorial table is small).
 */
export async function listArticles(
  filters: ArticleFilters
): Promise<ArticleList> {
  const supabase = await createClient()

  let query = supabase
    .from("articles")
    .select(
      "id, title, slug, status, published_at, updated_at, author:profiles(full_name, email), article_products(count)"
    )
    .order("updated_at", { ascending: false })
  if (filters.q) query = query.ilike("title", likePattern(filters.q))

  const { data, error } = await query
  if (error) throw error

  const all = data.map(({ author, article_products, ...article }) => ({
    ...article,
    authorName: author?.full_name ?? author?.email ?? null,
    productCount: article_products[0]?.count ?? 0,
  }))

  return {
    articles:
      filters.status === "all"
        ? all
        : all.filter((article) => article.status === filters.status),
    counts: {
      all: all.length,
      draft: all.filter((article) => article.status === "draft").length,
      published: all.filter((article) => article.status === "published").length,
    },
  }
}

export async function getArticle(id: string): Promise<EditableArticle | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("articles")
    .select(
      "id, title, slug, excerpt, body, status, published_at, updated_at, article_products(product_id)"
    )
    .eq("id", id)
    .maybeSingle()
  if (error) throw error
  if (!data) return null

  const { article_products, ...article } = data
  return {
    ...article,
    productIds: article_products.map((link) => link.product_id),
  }
}

/** Catalog for the linked-products picker, sorted by category then name. */
export async function listArticleProductOptions(): Promise<
  ArticleProductOption[]
> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select("id, name, brands(name), categories(name)")
    .order("name")
  if (error) throw error

  return data
    .map((product) => ({
      id: product.id,
      name: product.name,
      brand: product.brands.name,
      category: product.categories.name,
    }))
    .sort(
      (a, b) =>
        a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
    )
}
