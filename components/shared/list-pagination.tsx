import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { ButtonLink } from "@/components/shared/button-link"
import { formatNumber } from "@/lib/format"

/**
 * Previous / next navigation for a server-paginated list. Page state lives in
 * the URL; `searchParams` are the current filters (without `page`).
 */
export function ListPagination({
  page,
  pageCount,
  pathname,
  searchParams,
}: {
  page: number
  pageCount: number
  pathname: string
  searchParams: Record<string, string | undefined>
}) {
  if (pageCount <= 1) return null

  function href(target: number) {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value)
    }
    if (target > 1) params.set("page", String(target))
    const search = params.toString()
    return search ? `${pathname}?${search}` : pathname
  }

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-2"
    >
      <p className="text-sm text-muted-foreground tabular-nums">
        Page {formatNumber(page)} of {formatNumber(pageCount)}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <ButtonLink
            variant="outline"
            size="sm"
            href={href(page - 1)}
            scroll={false}
          >
            <ChevronLeftIcon data-icon="inline-start" />
            Previous
          </ButtonLink>
        ) : null}
        {page < pageCount ? (
          <ButtonLink
            variant="outline"
            size="sm"
            href={href(page + 1)}
            scroll={false}
          >
            Next
            <ChevronRightIcon data-icon="inline-end" />
          </ButtonLink>
        ) : null}
      </div>
    </nav>
  )
}
