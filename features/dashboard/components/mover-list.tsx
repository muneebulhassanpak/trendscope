import Link from "next/link"
import { ArrowRightIcon, type LucideIcon } from "lucide-react"

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
import { ChangeBadge } from "@/components/shared/change-badge"
import { ProductSwatch } from "@/components/shared/product-swatch"
import { Sparkline } from "@/components/shared/sparkline"
import { formatPrice } from "@/lib/format"
import type { Mover } from "@/features/dashboard/types"

export function MoverList({
  title,
  description,
  href,
  movers,
  emptyIcon: EmptyIcon,
  emptyTitle,
}: {
  title: string
  description: string
  /** Full ranking in the product list. */
  href: string
  movers: Mover[]
  emptyIcon: LucideIcon
  emptyTitle: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <ButtonLink
            variant="ghost"
            size="sm"
            href={href}
            aria-label={`View all ${title.toLowerCase()}`}
          >
            View all
            <ArrowRightIcon data-icon="inline-end" />
          </ButtonLink>
        </CardAction>
      </CardHeader>
      <CardContent>
        {movers.length ? (
          <ol className="-mx-2 flex flex-col">
            {movers.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/products/${product.slug}`}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none"
                >
                  <ProductSwatch
                    color={product.color}
                    brand={product.brand_name}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{product.name}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {product.brand_name} · {product.category_name}
                    </div>
                  </div>
                  <Sparkline
                    values={product.sparkline.map((point) => point.price)}
                    width={72}
                    className="hidden shrink-0 sm:block"
                  />
                  <div className="flex w-24 shrink-0 flex-col items-end">
                    <span className="font-medium tabular-nums">
                      {formatPrice(product.latest_price)}
                    </span>
                    <ChangeBadge
                      value={product.change_30d_pct}
                      className="text-xs"
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <EmptyIcon />
              </EmptyMedia>
              <EmptyTitle>{emptyTitle}</EmptyTitle>
              <EmptyDescription>
                Products appear here once prices move over 30 days.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}
