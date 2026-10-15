import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"

import { Markdown } from "@/components/shared/markdown"
import { ArticleCover } from "@/features/insights/components/article-cover"
import { ArticleMeta } from "@/features/insights/components/article-meta"
import { ArticleProductCard } from "@/features/insights/components/article-product-card"
import {
  getPublishedArticle,
  listArticleProducts,
} from "@/features/insights/queries"

export async function generateMetadata({
  params,
}: PageProps<"/insights/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const article = await getPublishedArticle(slug)
  if (!article) return { title: "Report not found" }
  return { title: article.title, description: article.excerpt ?? undefined }
}

export default async function InsightPage({
  params,
}: PageProps<"/insights/[slug]">) {
  const { slug } = await params
  const article = await getPublishedArticle(slug)
  if (!article) notFound()

  const products = await listArticleProducts(article.id)

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <Link
        href="/insights"
        className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Insights
      </Link>

      <header className="flex max-w-3xl flex-col gap-4">
        <ArticleMeta
          publishedAt={article.published_at}
          readingMinutes={article.readingMinutes}
          className="text-sm"
        />
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {article.title}
        </h1>
        {article.excerpt && (
          <p className="text-lg leading-relaxed text-pretty text-muted-foreground">
            {article.excerpt}
          </p>
        )}
      </header>

      <ArticleCover
        slug={article.slug}
        className="h-36 rounded-xl sm:h-48 lg:h-56"
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
        <Markdown className="max-w-[68ch]">{article.body}</Markdown>

        {products.length > 0 && (
          <aside
            aria-labelledby="report-products"
            className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start"
          >
            <h2
              id="report-products"
              className="text-sm font-medium text-muted-foreground"
            >
              Products in this report
            </h2>
            <ul className="flex flex-col gap-2">
              {products.map((product) => (
                <li key={product.id}>
                  <ArticleProductCard product={product} />
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </div>
  )
}
