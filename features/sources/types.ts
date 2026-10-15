import type { Enums, Tables } from "@/lib/supabase/database.types"

export type Source = Tables<"sources">

export type SourceType = Enums<"source_type">

/** A row in the admin sources table. */
export type SourceListItem = Pick<
  Source,
  "id" | "title" | "url" | "type" | "created_at"
> & {
  /** Number of observations citing this source. */
  citationCount: number
}

/** A source offered when linking observations. */
export type SourceOption = Pick<Source, "id" | "title" | "url" | "type">

export type SourceListPage = {
  items: SourceListItem[]
  total: number
  page: number
  pageCount: number
}
