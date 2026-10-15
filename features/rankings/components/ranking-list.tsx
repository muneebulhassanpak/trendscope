import Link from "next/link"

import { ChangeBadge } from "@/components/shared/change-badge"
import { ProductSwatch } from "@/components/shared/product-swatch"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { RankedProduct } from "@/features/rankings/types"

/** Numbered leaderboard; the bar shows each metric relative to the leader. */
export function RankingList({
  products,
  showRetail,
}: {
  products: RankedProduct[]
  showRetail: boolean
}) {
  const max = Math.max(...products.map((product) => Math.abs(product.metric)))

  return (
    <ol
      aria-label="Leaderboard"
      className="divide-y overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10"
    >
      {products.map((product) => {
        const bar = (
          <MagnitudeBar value={product.metric} max={max} className="w-full" />
        )
        return (
          <li
            key={product.id}
            className="group relative flex items-center gap-3 px-3 py-3 transition-colors hover:bg-muted/50 sm:gap-4 sm:px-4"
          >
            <span className="w-5 shrink-0 text-right text-sm font-medium text-muted-foreground tabular-nums">
              {product.rank}
            </span>
            <ProductSwatch
              color={product.color}
              brand={product.brand_name}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <Link
                href={`/products/${product.slug}`}
                className="line-clamp-2 text-sm font-medium group-hover:underline after:absolute after:inset-0 sm:block sm:truncate"
              >
                {product.name}
              </Link>
              <div className="truncate text-xs text-muted-foreground">
                {product.brand_name} · {product.category_name}
              </div>
              <div className="mt-2 sm:hidden">{bar}</div>
            </div>
            <div className="hidden w-32 shrink-0 sm:block lg:w-56">{bar}</div>
            <div className="flex shrink-0 flex-col items-end gap-0.5 sm:w-24">
              <span className="text-sm font-medium tabular-nums">
                {formatPrice(product.latest_price)}
              </span>
              {showRetail && (
                <span className="text-xs text-muted-foreground tabular-nums">
                  Retail {formatPrice(product.retail_price)}
                </span>
              )}
              <ChangeBadge value={product.metric} />
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/** Decorative magnitude bar; the adjacent ChangeBadge carries sign and value. */
function MagnitudeBar({
  value,
  max,
  className,
}: {
  value: number
  max: number
  className?: string
}) {
  const width = max > 0 ? Math.max((Math.abs(value) / max) * 100, 2) : 0
  return (
    <div
      aria-hidden
      className={cn("h-1.5 overflow-hidden rounded-full bg-muted", className)}
    >
      <div
        className={cn(
          "h-full rounded-full",
          value >= 0 ? "bg-positive/80" : "bg-negative/80"
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}
