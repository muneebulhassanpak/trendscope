import Link from "next/link"
import { ArrowUpRightIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ArticleCover } from "@/features/insights/components/article-cover"
import { ArticleMeta } from "@/features/insights/components/article-meta"
import type { ArticleSummary } from "@/features/insights/types"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

/**
 * The whole card is clickable through a stretched title link; product chips sit
 * above it (z-10) so they stay independently clickable without nesting links.
 */
export function ArticleCard({
  article,
  featured = false,
}: {
  article: ArticleSummary
  featured?: boolean
}) {
  const maxChips = featured ? 4 : 3
  const chips = article.products.slice(0, maxChips)
  const hidden = article.products.length - chips.length

  return (
    <article
      className={cn(
        "group/article relative flex flex-col overflow-hidden rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10 transition-shadow duration-300 hover:ring-foreground/25 has-[a[data-article-link]:focus-visible]:ring-2 has-[a[data-article-link]:focus-visible]:ring-ring",
        featured && "lg:grid lg:grid-cols-[1.35fr_1fr]"
      )}
    >
      <div className="relative overflow-hidden">
        <ArticleCover
          slug={article.slug}
          className={cn(
            "aspect-[2/1] transition-transform duration-700 ease-out group-hover/article:scale-[1.03] lg:aspect-[5/2]",
            featured && "aspect-video lg:aspect-auto lg:h-full lg:min-h-80"
          )}
        />
        {featured && (
          <span className="absolute top-4 left-4 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium tracking-wide text-white uppercase ring-1 ring-white/15 backdrop-blur-sm">
            Latest report
          </span>
        )}
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col gap-3 p-5",
          featured && "sm:p-6 lg:justify-center lg:gap-4 lg:p-8"
        )}
      >
        <ArticleMeta
          publishedAt={article.published_at}
          readingMinutes={article.readingMinutes}
        />
        <h2
          className={cn(
            "font-semibold tracking-tight text-balance",
            featured ? "text-2xl sm:text-3xl" : "text-lg leading-snug"
          )}
        >
          <Link
            href={`/insights/${article.slug}`}
            data-article-link
            className="outline-none after:absolute after:inset-0"
          >
            {article.title}
          </Link>
        </h2>
        {article.excerpt && (
          <p
            className={cn(
              "text-sm leading-relaxed text-muted-foreground",
              featured ? "sm:text-base" : "line-clamp-3"
            )}
          >
            {article.excerpt}
          </p>
        )}

        {chips.length > 0 && (
          <ul
            aria-label="Products in this report"
            className="relative z-10 mt-auto flex flex-wrap gap-1.5 pt-2"
          >
            {chips.map((product) => (
              <li key={product.slug} className="max-w-full">
                <Badge
                  variant="outline"
                  className="max-w-full"
                  render={<Link href={`/products/${product.slug}`} />}
                >
                  <span className="truncate">{product.name}</span>
                </Badge>
              </li>
            ))}
            {hidden > 0 && (
              <li>
                <Badge variant="ghost" className="text-muted-foreground">
                  +{formatNumber(hidden)} more
                </Badge>
              </li>
            )}
          </ul>
        )}

        {featured && (
          <span className="hidden items-center gap-1 text-sm font-medium lg:inline-flex">
            Read report
            <ArrowUpRightIcon className="size-4 transition-transform group-hover/article:translate-x-0.5 group-hover/article:-translate-y-0.5" />
          </span>
        )}
      </div>
    </article>
  )
}
