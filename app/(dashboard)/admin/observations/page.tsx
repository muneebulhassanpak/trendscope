import type { Metadata } from "next"
import { NotebookPenIcon, SearchXIcon } from "lucide-react"

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
import {
  NewObservationButton,
  ObservationEditor,
} from "@/features/observations/components/observation-editor"
import { ObservationFilters } from "@/features/observations/components/observation-filters"
import { ObservationTable } from "@/features/observations/components/observation-table"
import {
  listObservationProductOptions,
  listObservations,
  listObservationTags,
} from "@/features/observations/queries"
import { parseObservationFilters } from "@/features/observations/schemas"
import { listSourceOptions } from "@/features/sources/queries"

export const metadata: Metadata = { title: "Observations" }

export default async function ObservationsPage({
  searchParams,
}: PageProps<"/admin/observations">) {
  const filters = parseObservationFilters(await searchParams)
  const [{ items, total, page, pageCount }, products, sources, tags] =
    await Promise.all([
      listObservations(filters),
      listObservationProductOptions(),
      listSourceOptions(),
      listObservationTags(),
    ])
  const filtered = Boolean(filters.q || filters.product || filters.tag)

  return (
    <ObservationEditor products={products} sources={sources}>
      <PageHeader
        title="Observations"
        description="Field notes linked to products, tagged and backed by sources."
        actions={<NewObservationButton />}
      />
      <ObservationFilters filters={filters} products={products} tags={tags} />
      <p className="-mt-2 text-sm text-muted-foreground" aria-live="polite">
        {formatNumber(total)} {total === 1 ? "observation" : "observations"}
      </p>
      {items.length ? (
        <>
          <ObservationTable observations={items} />
          <ListPagination
            page={page}
            pageCount={pageCount}
            pathname="/admin/observations"
            searchParams={{
              q: filters.q,
              product: filters.product,
              tag: filters.tag,
            }}
          />
        </>
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              {filtered ? <SearchXIcon /> : <NotebookPenIcon />}
            </EmptyMedia>
            <EmptyTitle>
              {filtered ? "No matching observations" : "No observations yet"}
            </EmptyTitle>
            <EmptyDescription>
              {filtered
                ? "Try a different search term or clear the filters."
                : "Record what you see in the market — notes appear on product pages."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </ObservationEditor>
  )
}
