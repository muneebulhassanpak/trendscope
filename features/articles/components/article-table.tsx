import Link from "next/link"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate, formatNumber } from "@/lib/format"
import { ArticleRowActions } from "@/features/articles/components/article-row-actions"
import { ArticleStatusBadge } from "@/features/articles/components/article-status-badge"
import type { ArticleListItem } from "@/features/articles/types"

/** Published articles show their publish date; drafts their last edit. */
function articleDate(article: ArticleListItem) {
  return article.status === "published" && article.published_at
    ? { label: "Published", value: article.published_at }
    : { label: "Updated", value: article.updated_at }
}

function productLabel(count: number) {
  return `${formatNumber(count)} ${count === 1 ? "product" : "products"}`
}

export function ArticleTable({ articles }: { articles: ArticleListItem[] }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl ring-1 ring-foreground/10 md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Article</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Products</TableHead>
              <TableHead className="hidden lg:table-cell">Author</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-12 pr-4">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((article) => {
              const date = articleDate(article)
              return (
                <TableRow key={article.id}>
                  <TableCell className="max-w-0 pl-4 lg:w-1/2">
                    <Link
                      href={`/admin/articles/${article.id}/edit`}
                      className="block truncate font-medium hover:underline"
                    >
                      {article.title}
                    </Link>
                    <div className="truncate font-mono text-xs text-muted-foreground">
                      /{article.slug}
                    </div>
                  </TableCell>
                  <TableCell>
                    <ArticleStatusBadge status={article.status} />
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground tabular-nums">
                    {formatNumber(article.productCount)}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {article.authorName ?? "—"}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-muted-foreground">
                      {date.label}
                    </div>
                    <time dateTime={date.value} className="tabular-nums">
                      {formatDate(date.value)}
                    </time>
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <ArticleRowActions article={article} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <ul className="flex flex-col gap-2 md:hidden">
        {articles.map((article) => {
          const date = articleDate(article)
          return (
            <li
              key={article.id}
              className="flex items-start gap-2 rounded-xl bg-card p-3 pr-2 ring-1 ring-foreground/10"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Link
                  href={`/admin/articles/${article.id}/edit`}
                  className="line-clamp-2 text-sm font-medium text-pretty hover:underline"
                >
                  {article.title}
                </Link>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <ArticleStatusBadge status={article.status} />
                  <span>
                    {date.label}{" "}
                    <time dateTime={date.value}>{formatDate(date.value)}</time>
                  </span>
                  <span aria-hidden>·</span>
                  <span>{productLabel(article.productCount)}</span>
                </div>
              </div>
              <ArticleRowActions article={article} />
            </li>
          )
        })}
      </ul>
    </>
  )
}
