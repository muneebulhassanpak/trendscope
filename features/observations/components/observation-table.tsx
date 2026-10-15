import Link from "next/link"
import { LinkIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ProductSwatch } from "@/components/shared/product-swatch"
import { formatDate, formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"
import { DeleteObservationButton } from "@/features/observations/components/delete-observation-button"
import { EditObservationButton } from "@/features/observations/components/observation-editor"
import type { ObservationListItem } from "@/features/observations/types"

export function ObservationTable({
  observations,
}: {
  observations: ObservationListItem[]
}) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl ring-1 ring-foreground/10 md:block">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Note</TableHead>
              <TableHead className="w-52 lg:w-60">Product</TableHead>
              <TableHead className="hidden w-48 xl:table-cell">Tags</TableHead>
              <TableHead className="w-24 text-right">Sources</TableHead>
              <TableHead className="hidden w-32 text-right lg:table-cell">
                Observed
              </TableHead>
              <TableHead className="w-24 pr-4">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {observations.map((observation) => (
              <TableRow key={observation.id}>
                <TableCell className="pl-4 whitespace-normal">
                  <p className="line-clamp-2 leading-relaxed">
                    {observation.note}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 empty:hidden xl:hidden">
                    <time
                      dateTime={observation.observed_at}
                      className="text-xs text-muted-foreground lg:hidden"
                    >
                      {formatDate(observation.observed_at)}
                    </time>
                    <TagList tags={observation.tags} />
                  </div>
                </TableCell>
                <TableCell>
                  <ProductCell observation={observation} />
                </TableCell>
                <TableCell className="hidden whitespace-normal xl:table-cell">
                  <TagList tags={observation.tags} />
                </TableCell>
                <TableCell className="text-right">
                  <SourceCount count={observation.sourceIds.length} />
                </TableCell>
                <TableCell className="hidden text-right text-muted-foreground tabular-nums lg:table-cell">
                  <time dateTime={observation.observed_at}>
                    {formatDate(observation.observed_at)}
                  </time>
                </TableCell>
                <TableCell className="pr-4">
                  <ObservationActions observation={observation} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="flex flex-col gap-2 md:hidden">
        {observations.map((observation) => (
          <li
            key={observation.id}
            className="flex flex-col gap-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10"
          >
            <div className="flex items-start justify-between gap-2">
              <ProductCell observation={observation} />
              <ObservationActions observation={observation} />
            </div>
            <p className="line-clamp-3 text-sm leading-relaxed">
              {observation.note}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
              <time dateTime={observation.observed_at}>
                {formatDate(observation.observed_at)}
              </time>
              <SourceCount count={observation.sourceIds.length} />
              <TagList tags={observation.tags} />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

function ProductCell({ observation }: { observation: ObservationListItem }) {
  const { product } = observation
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <ProductSwatch
        color={product.color}
        brand={product.brand}
        size="sm"
        className="size-8 rounded-md text-[0.625rem]"
      />
      <div className="min-w-0">
        <Link
          href={`/products/${product.slug}`}
          className="block truncate text-sm font-medium hover:underline"
        >
          {product.name}
        </Link>
        <div className="truncate text-xs text-muted-foreground">
          {product.brand}
        </div>
      </div>
    </div>
  )
}

function TagList({ tags }: { tags: string[] }) {
  if (!tags.length) return null
  return (
    <ul aria-label="Tags" className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <li key={tag}>
          <Badge
            variant="outline"
            render={
              <Link
                href={`/admin/observations?tag=${encodeURIComponent(tag)}`}
                aria-label={`Filter by tag ${tag}`}
              />
            }
          >
            {tag}
          </Badge>
        </li>
      ))}
    </ul>
  )
}

function SourceCount({ count }: { count: number }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 tabular-nums",
        count ? "text-foreground" : "text-muted-foreground"
      )}
    >
      <LinkIcon aria-hidden className="size-3.5 text-muted-foreground" />
      {formatNumber(count)}
      <span className="sr-only">{count === 1 ? " source" : " sources"}</span>
    </span>
  )
}

function ObservationActions({
  observation,
}: {
  observation: ObservationListItem
}) {
  return (
    <div className="flex shrink-0 items-center justify-end gap-1">
      <EditObservationButton observation={observation} />
      <DeleteObservationButton observation={observation} />
    </div>
  )
}
