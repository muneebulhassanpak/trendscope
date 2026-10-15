"use client"

import { startTransition, useOptimistic } from "react"
import { SearchIcon } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useUrlFilters } from "@/hooks/use-url-filters"
import { formatNumber } from "@/lib/format"
import {
  ARTICLE_STATUS_FILTERS,
  type ArticleFilters,
  type ArticleStatusFilter,
} from "@/features/articles/schemas"
import type { ArticleList } from "@/features/articles/types"

const STATUSES = Object.keys(ARTICLE_STATUS_FILTERS) as ArticleStatusFilter[]

/** Status segments and a debounced title search, both kept in the URL. */
export function ArticleFilters({
  filters,
  counts,
}: {
  filters: ArticleFilters
  counts: ArticleList["counts"]
}) {
  const { pending, query, setQuery, update } = useUrlFilters()
  // Highlights the chosen segment immediately while the list reloads.
  const [status, setOptimisticStatus] = useOptimistic(filters.status)

  function selectStatus(next: ArticleStatusFilter) {
    startTransition(() => {
      setOptimisticStatus(next)
      update({ status: next === "all" ? null : next })
    })
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <ToggleGroup
        variant="outline"
        size="sm"
        spacing={0}
        value={[status]}
        onValueChange={(value) => {
          const next = value[0] as ArticleStatusFilter | undefined
          if (next) selectStatus(next)
        }}
        aria-label="Filter by status"
        className="w-full sm:w-fit"
      >
        {STATUSES.map((key) => (
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
        ))}
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
