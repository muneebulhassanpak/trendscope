import type { Metadata } from "next"
import { NewspaperIcon } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { PageHeader } from "@/components/shared/page-header"
import { ArticleCard } from "@/features/insights/components/article-card"
import { listPublishedArticles } from "@/features/insights/queries"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Insights",
  description: "Published trend reports and market analyses.",
}

export default async function InsightsPage() {
  const [featured, ...rest] = await listPublishedArticles()

  return (
    <>
      <PageHeader
        title="Insights"
        description="Trend reports and market analyses from the research team."
      />
      {featured ? (
        <>
          <ArticleCard article={featured} featured />
          {rest.length > 0 && (
            <section
              aria-labelledby="more-reports"
              className="flex flex-col gap-4"
            >
              <h2
                id="more-reports"
                className="text-sm font-medium text-muted-foreground"
              >
                More reports
              </h2>
              <div
                className={cn(
                  "grid gap-4 sm:grid-cols-2",
                  rest.length > 2 && "xl:grid-cols-3"
                )}
              >
                {rest.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <NewspaperIcon />
            </EmptyMedia>
            <EmptyTitle>No reports published yet</EmptyTitle>
            <EmptyDescription>
              New trend reports and market analyses will appear here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </>
  )
}
