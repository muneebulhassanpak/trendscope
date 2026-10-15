import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeftIcon,
  ExternalLinkIcon,
  GitCompareArrowsIcon,
  NewspaperIcon,
  NotebookPenIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
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
import { ChangeBadge } from "@/components/shared/change-badge"
import { ProductSwatch } from "@/components/shared/product-swatch"
import { PriceHistoryChart } from "@/features/products/components/price-history-chart"
import {
  getPriceHistory,
  getProductBySlug,
  listProductArticles,
  listProductObservations,
} from "@/features/products/queries"
import { formatDate, formatPrice } from "@/lib/format"

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  return { title: product?.name ?? "Product not found" }
}

export default async function ProductPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product?.id) notFound()

  const [history, observations, articles] = await Promise.all([
    getPriceHistory(product.id),
    listProductObservations(product.id),
    listProductArticles(product.id),
  ])

  const prices = history.map((point) => point.price)
  const stats = [
    { label: "Retail price", value: formatPrice(product.retail_price) },
    {
      label: "1y high",
      value: prices.length ? formatPrice(Math.max(...prices)) : "—",
    },
    {
      label: "1y low",
      value: prices.length ? formatPrice(Math.min(...prices)) : "—",
    },
    {
      label: "Released",
      value: product.release_date ? formatDate(product.release_date) : "—",
    },
    { label: "Color", value: product.color ?? "—" },
    { label: "Material", value: product.material ?? "—" },
  ]

  return (
    <>
      <Link
        href="/products"
        className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Products
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <ProductSwatch
            color={product.color}
            brand={product.brand_name}
            size="lg"
          />
          <div className="flex min-w-0 flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {product.name}
            </h1>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{product.brand_name}</Badge>
              <Badge variant="outline">{product.category_name}</Badge>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href={`/compare?products=${product.slug}`} />}
        >
          <GitCompareArrowsIcon />
          Compare
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card size="sm">
          <CardHeader>
            <CardDescription>Last price</CardDescription>
            <CardTitle>
              <span className="text-2xl font-medium tabular-nums">
                {formatPrice(product.latest_price)}
              </span>
            </CardTitle>
            {product.latest_recorded_on && (
              <div className="text-xs text-muted-foreground">
                as of {formatDate(product.latest_recorded_on)}
              </div>
            )}
          </CardHeader>
        </Card>
        {[
          { label: "7 days", value: product.change_7d_pct },
          { label: "30 days", value: product.change_30d_pct },
          { label: "vs retail", value: product.premium_pct },
        ].map((item) => (
          <Card key={item.label} size="sm">
            <CardHeader>
              <CardDescription>{item.label}</CardDescription>
              <CardTitle>
                <ChangeBadge value={item.value} className="text-2xl" />
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Price history</CardTitle>
            <CardDescription>
              Daily resale price · dashed line marks retail
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PriceHistoryChart
              points={history}
              retailPrice={product.retail_price}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {product.description && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            )}
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-muted-foreground">{stat.label}</dt>
                  <dd className="font-medium tabular-nums">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Market observations</CardTitle>
            <CardDescription>
              Field notes from the research team
            </CardDescription>
          </CardHeader>
          <CardContent>
            {observations.length ? (
              <ul className="flex flex-col divide-y">
                {observations.map((observation) => (
                  <li
                    key={observation.id}
                    className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0"
                  >
                    <p className="text-sm leading-relaxed">
                      {observation.note}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <time dateTime={observation.observed_at}>
                        {formatDate(observation.observed_at)}
                      </time>
                      {observation.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                      {observation.sources.map((source) => (
                        <a
                          key={source.id}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="inline-flex items-center gap-1 hover:text-foreground"
                        >
                          {source.title}
                          <ExternalLinkIcon className="size-3" />
                        </a>
                      ))}
                    </div>
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

        <Card>
          <CardHeader>
            <CardTitle>Related insights</CardTitle>
            <CardDescription>Reports that cover this product</CardDescription>
          </CardHeader>
          <CardContent>
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
                  <EmptyTitle>No related insights</EmptyTitle>
                  <EmptyDescription>
                    Published reports linking this product appear here.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
