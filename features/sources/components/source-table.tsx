import { ArrowUpRightIcon } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate, formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"
import { DeleteSourceButton } from "@/features/sources/components/delete-source-button"
import { SourceFormDialog } from "@/features/sources/components/source-form-dialog"
import { SourceTypeBadge } from "@/features/sources/components/source-type-badge"
import { sourceDomain } from "@/features/sources/source-domain"
import type { SourceListItem } from "@/features/sources/types"

export function SourceTable({ sources }: { sources: SourceListItem[] }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl ring-1 ring-foreground/10 md:block">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Source</TableHead>
              <TableHead className="w-28">Type</TableHead>
              <TableHead className="hidden w-48 lg:table-cell">
                Domain
              </TableHead>
              <TableHead className="w-36 text-right">Cited by</TableHead>
              <TableHead className="hidden w-32 text-right lg:table-cell">
                Added
              </TableHead>
              <TableHead className="w-24 pr-4">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sources.map((source) => (
              <TableRow key={source.id}>
                <TableCell className="pl-4">
                  <SourceLink source={source} />
                  <div className="truncate text-xs text-muted-foreground lg:hidden">
                    {sourceDomain(source.url)}
                  </div>
                </TableCell>
                <TableCell>
                  <SourceTypeBadge type={source.type} />
                </TableCell>
                <TableCell className="hidden truncate text-muted-foreground lg:table-cell">
                  {sourceDomain(source.url)}
                </TableCell>
                <TableCell className="text-right">
                  <CitationCount count={source.citationCount} />
                </TableCell>
                <TableCell className="hidden text-right text-muted-foreground tabular-nums lg:table-cell">
                  {formatDate(source.created_at)}
                </TableCell>
                <TableCell className="pr-4">
                  <SourceActions source={source} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="flex flex-col gap-2 md:hidden">
        {sources.map((source) => (
          <li
            key={source.id}
            className="flex flex-col gap-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <SourceLink source={source} />
                <div className="truncate text-xs text-muted-foreground">
                  {sourceDomain(source.url)}
                </div>
              </div>
              <SourceActions source={source} />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
              <SourceTypeBadge type={source.type} />
              <CitationCount count={source.citationCount} />
              <span>Added {formatDate(source.created_at)}</span>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

function SourceLink({ source }: { source: SourceListItem }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="group inline-flex max-w-full items-center gap-1 font-medium hover:underline"
    >
      <span className="line-clamp-2 md:line-clamp-1">{source.title}</span>
      <ArrowUpRightIcon
        aria-hidden
        className="size-3.5 shrink-0 text-muted-foreground group-hover:text-foreground"
      />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  )
}

function CitationCount({ count }: { count: number }) {
  return (
    <span
      className={cn(
        "tabular-nums",
        count > 0 ? "text-foreground" : "text-muted-foreground"
      )}
    >
      {formatNumber(count)} {count === 1 ? "observation" : "observations"}
    </span>
  )
}

function SourceActions({ source }: { source: SourceListItem }) {
  return (
    <div className="flex shrink-0 items-center justify-end gap-1">
      <SourceFormDialog source={source} />
      <DeleteSourceButton source={source} />
    </div>
  )
}
