import type { Tables } from "@/lib/supabase/database.types"

type Article = Tables<"articles">

export type ArticleProductLink = Pick<Tables<"products">, "name" | "slug">

/** Card data for the article list — the body is reduced to a reading time. */
export type ArticleSummary = Pick<
  Article,
  "id" | "title" | "slug" | "excerpt" | "published_at"
> & {
  readingMinutes: number
  products: ArticleProductLink[]
}

export type PublishedArticle = Pick<
  Article,
  "id" | "title" | "slug" | "excerpt" | "body" | "published_at"
> & {
  readingMinutes: number
}

export type ArticleProduct = Pick<
  Tables<"product_overview">,
  | "id"
  | "name"
  | "slug"
  | "brand_name"
  | "category_name"
  | "color"
  | "latest_price"
  | "change_30d_pct"
>
