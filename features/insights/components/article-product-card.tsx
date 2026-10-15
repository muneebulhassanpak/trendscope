import Link from "next/link"
import { ChevronRightIcon } from "lucide-react"

import { ChangeBadge } from "@/components/shared/change-badge"
import { ProductSwatch } from "@/components/shared/product-swatch"
import type { ArticleProduct } from "@/features/insights/types"
import { formatPrice } from "@/lib/format"

export function ArticleProductCard({ product }: { product: ArticleProduct }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex items-center gap-3 rounded-xl bg-card p-3 text-card-foreground ring-1 ring-foreground/10 transition-colors outline-none hover:bg-muted/50 hover:ring-foreground/20 focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ProductSwatch color={product.color} brand={product.brand_name} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="line-clamp-2 text-sm leading-snug font-medium">
          {product.name}
        </span>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          <span className="font-medium text-foreground tabular-nums">
            {formatPrice(product.latest_price)}
          </span>
          <span className="inline-flex items-center gap-1">
            <ChangeBadge value={product.change_30d_pct} className="text-xs" />
            30d
          </span>
          <span className="truncate">{product.category_name}</span>
        </span>
      </div>
      <ChevronRightIcon
        aria-hidden
        className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  )
}
