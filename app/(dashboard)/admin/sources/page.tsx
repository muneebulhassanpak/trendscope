import type { Metadata } from "next"
import { LinkIcon, SearchXIcon } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ListPagination } from "@/components/shared/list-pagination"
import { PageHeader } from "@/components/shared/page-header"
import { formatNumber } from "@/lib/format"
import { SourceFilters } from "@/features/sources/components/source-filters"
import { SourceFormDialog } from "@/features/sources/components/source-form-dialog"
import { SourceTable } from "@/features/sources/components/source-table"
import { listSources } from "@/features/sources/queries"
import { parseSourceFilters } from "@/features/sources/schemas"

export const metadata: Metadata = { title: "Sources" }

export default async function SourcesPage({
  searchParams,
}: PageProps<"/admin/sources">) {
  const filters = parseSourceFilters(await searchParams)
  const { items, total, page, pageCount } = await listSources(filters)
  const filtered = Boolean(filters.q || filters.type)

  return (
    <>
      <PageHeader
        title="Sources"
        description="External links and research references cited by observations."
        actions={<SourceFormDialog />}
      />
      <SourceFilters filters={filters} />
      <p className="-mt-2 text-sm text-muted-foreground" aria-live="polite">
        {formatNumber(total)} {total === 1 ? "source" : "sources"}
      </p>
      {items.length ? (
        <>
          <SourceTable sources={items} />
          <ListPagination
            page={page}
            pageCount={pageCount}
            pathname="/admin/sources"
            searchParams={{ q: filters.q, type: filters.type }}
          />
        </>
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              {filtered ? <SearchXIcon /> : <LinkIcon />}
            </EmptyMedia>
            <EmptyTitle>
              {filtered ? "No matching sources" : "No sources yet"}
            </EmptyTitle>
            <EmptyDescription>
              {filtered
                ? "Try a different search term or clear the filters."
                : "Add the reports, articles and posts your observations rely on."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </>
  )
}
