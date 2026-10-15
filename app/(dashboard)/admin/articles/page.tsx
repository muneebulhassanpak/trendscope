import type { Metadata } from "next"
import { FileTextIcon, PlusIcon, SearchXIcon } from "lucide-react"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ButtonLink } from "@/components/shared/button-link"
import { PageHeader } from "@/components/shared/page-header"
import { ArticleFilters } from "@/features/articles/components/article-filters"
import { ArticleTable } from "@/features/articles/components/article-table"
import { listArticles } from "@/features/articles/queries"
import { parseArticleFilters } from "@/features/articles/schemas"

export const metadata: Metadata = { title: "Articles" }

export default async function ArticlesPage({
  searchParams,
}: PageProps<"/admin/articles">) {
  const filters = parseArticleFilters(await searchParams)
  const { articles, counts } = await listArticles(filters)
  const isFiltered = filters.status !== "all" || Boolean(filters.q)

  return (
    <>
      <PageHeader
        title="Articles"
        description="Write, publish and link trend reports to products."
        actions={
          <ButtonLink href="/admin/articles/new">
            <PlusIcon data-icon="inline-start" />
            New article
          </ButtonLink>
        }
      />
      <ArticleFilters filters={filters} counts={counts} />
      {articles.length ? (
        <ArticleTable articles={articles} />
      ) : isFiltered ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchXIcon />
            </EmptyMedia>
            <EmptyTitle>No matching articles</EmptyTitle>
            <EmptyDescription>
              Try a different search term or status.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileTextIcon />
            </EmptyMedia>
            <EmptyTitle>No articles yet</EmptyTitle>
            <EmptyDescription>
              Draft your first trend report and publish it to Insights.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <ButtonLink href="/admin/articles/new">
              <PlusIcon data-icon="inline-start" />
              New article
            </ButtonLink>
          </EmptyContent>
        </Empty>
      )}
    </>
  )
}
