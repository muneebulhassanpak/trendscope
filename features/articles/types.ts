import type { Enums, Tables } from "@/lib/supabase/database.types"

type Article = Tables<"articles">

export type ArticleStatus = Enums<"article_status">

/** A row in the admin article list. */
export type ArticleListItem = Pick<
  Article,
  "id" | "title" | "slug" | "status" | "published_at" | "updated_at"
> & {
  /** Null when the author's profile is not readable (e.g. the demo role). */
  authorName: string | null
  productCount: number
}

export type ArticleList = {
  articles: ArticleListItem[]
  counts: Record<ArticleStatus | "all", number>
}

/** Everything the editor needs to edit an existing article. */
export type EditableArticle = Pick<
  Article,
  | "id"
  | "title"
  | "slug"
  | "excerpt"
  | "body"
  | "status"
  | "published_at"
  | "updated_at"
> & {
  productIds: string[]
}

/** An entry in the linked-products picker. */
export type ArticleProductOption = {
  id: string
  name: string
  brand: string
  category: string
}

/** Returned by `saveArticle` so the editor can sync to what was stored. */
export type SavedArticle = Omit<EditableArticle, "updated_at">
