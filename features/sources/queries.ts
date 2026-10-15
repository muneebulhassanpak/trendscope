import "server-only"

import { escapeLike } from "@/lib/supabase/escape-like"
import { createClient } from "@/lib/supabase/server"
import {
  SOURCES_PAGE_SIZE,
  type SourceFilters,
} from "@/features/sources/schemas"
import type { SourceListPage, SourceOption } from "@/features/sources/types"

/** PostgREST error for a page past the end of the result set. */
const RANGE_NOT_SATISFIABLE = "PGRST103"

/** PostgREST caps responses at 1,000 rows. */
const MAX_OPTIONS = 1000

/** One page of sources, newest first, with how often each is cited. */
export async function listSources(
  filters: SourceFilters
): Promise<SourceListPage> {
  const supabase = await createClient()
  const from = (filters.page - 1) * SOURCES_PAGE_SIZE

  let query = supabase
    .from("sources")
    .select("id, title, url, type, created_at, observation_sources(count)", {
      count: "exact",
    })
  if (filters.q) query = query.ilike("title", `%${escapeLike(filters.q)}%`)
  if (filters.type) query = query.eq("type", filters.type)

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .order("id")
    .range(from, from + SOURCES_PAGE_SIZE - 1)

  if (error?.code === RANGE_NOT_SATISFIABLE && filters.page > 1) {
    return listSources({ ...filters, page: 1 })
  }
  if (error) throw error

  const total = count ?? 0
  return {
    items: data.map(({ observation_sources, ...source }) => ({
      ...source,
      citationCount: observation_sources[0]?.count ?? 0,
    })),
    total,
    page: filters.page,
    pageCount: Math.max(1, Math.ceil(total / SOURCES_PAGE_SIZE)),
  }
}

/** Every source (up to the PostgREST row cap) for the observation form. */
export async function listSourceOptions(): Promise<SourceOption[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("sources")
    .select("id, title, url, type")
    .order("title")
    .limit(MAX_OPTIONS)
  if (error) throw error
  return data
}
