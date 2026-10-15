"use client"

import { useEffect, useOptimistic, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { SearchIcon } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { formatNumber } from "@/lib/format"
import {
  ARTICLE_STATUS_FILTERS,
  type ArticleFilters,
  type ArticleStatusFilter,
} from "@/features/articles/schemas"
import type { ArticleList } from "@/features/articles/types"

/** Status segments and a debounced title search, both kept in the URL. */
export function ArticleFilters({
  filters,
  counts,
}: {
  filters: ArticleFilters
  counts: ArticleList["counts"]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [status, setOptimisticStatus] = useOptimistic(filters.status)
  const [query, setQuery] = useState(filters.q ?? "")

  function update(changes: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value)
      else params.delete(key)
    }
    const search = params.toString()
    startTransition(() => {
      if ("status" in changes) {
        setOptimisticStatus((changes.status ?? "all") as ArticleStatusFilter)
      }
      router.replace(search ? `${pathname}?${search}` : pathname, {
        scroll: false,
      })
    })
  }

  // Debounce free-text search into the URL.
  useEffect(() => {
    const current = searchParams.get("q") ?? ""
    if (query.trim() === current) return
    const timeout = setTimeout(() => update({ q: query.trim() || null }), 300)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to typing
  }, [query])

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <ToggleGroup
        variant="outline"
        size="sm"
        spacing={0}
        value={[status]}
        onValueChange={(value) => {
          const next = value[0] as ArticleStatusFilter | undefined
          if (next) update({ status: next === "all" ? null : next })
        }}
        aria-label="Filter by status"
        className="w-full sm:w-fit"
      >
        {(Object.keys(ARTICLE_STATUS_FILTERS) as ArticleStatusFilter[]).map(
          (key) => (
            <ToggleGroupItem
              key={key}
              value={key}
              className="flex-1 gap-1.5 px-3 sm:flex-none"
            >
              {ARTICLE_STATUS_FILTERS[key]}
              <span className="text-xs text-muted-foreground tabular-nums">
                {formatNumber(counts[key])}
              </span>
            </ToggleGroupItem>
          )
        )}
      </ToggleGroup>

      <InputGroup className="sm:max-w-xs">
        <InputGroupAddon>
          {pending ? <Spinner /> : <SearchIcon />}
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          placeholder="Search titles…"
          aria-label="Search articles"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </InputGroup>
    </div>
  )
}
