import Link from "next/link"
import { ArrowRightIcon, NewspaperIcon, NotebookPenIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ButtonLink } from "@/components/shared/button-link"
import { formatDate } from "@/lib/format"
import type {
  LatestArticle,
  LatestObservation,
} from "@/features/dashboard/types"

export function LatestArticles({ articles }: { articles: LatestArticle[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest insights</CardTitle>
        <CardDescription>Research reports from the team</CardDescription>
        <CardAction>
          <ButtonLink
            variant="ghost"
            size="sm"
            href="/insights"
            aria-label="View all insights"
          >
            View all
            <ArrowRightIcon data-icon="inline-end" />
          </ButtonLink>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {articles.length ? (
          <ul className="flex flex-col divide-y">
            {articles.map((article) => (
              <li key={article.id} className="py-3 first:pt-0 last:pb-0">
                <Link
                  href={`/insights/${article.slug}`}
                  className="group flex flex-col gap-1"
                >
                  <span className="font-medium group-hover:underline">
                    {article.title}
                  </span>
                  {article.excerpt && (
                    <span className="line-clamp-2 text-sm text-muted-foreground">
                      {article.excerpt}
                    </span>
                  )}
                  {article.published_at && (
                    <time
                      dateTime={article.published_at}
                      className="text-xs text-muted-foreground"
                    >
                      {formatDate(article.published_at)}
                    </time>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <NewspaperIcon />
              </EmptyMedia>
              <EmptyTitle>No insights published yet</EmptyTitle>
              <EmptyDescription>
                Published research reports appear here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}

export function LatestObservations({
  observations,
}: {
  observations: LatestObservation[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Field notes</CardTitle>
        <CardDescription>Latest market observations</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {observations.length ? (
          <ul className="flex flex-col divide-y">
            {observations.map((observation) => (
              <li
                key={observation.id}
                className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <Link
                    href={`/products/${observation.product.slug}`}
                    className="min-w-0 truncate font-medium hover:underline"
                  >
                    {observation.product.name}
                  </Link>
                  <time
                    dateTime={observation.observed_at}
                    className="shrink-0 text-xs text-muted-foreground"
                  >
                    {formatDate(observation.observed_at)}
                  </time>
                </div>
                <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {observation.note}
                </p>
                {observation.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {observation.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <NotebookPenIcon />
              </EmptyMedia>
              <EmptyTitle>No observations yet</EmptyTitle>
              <EmptyDescription>
                Notes added in the admin area appear here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}
