import Link from "next/link"
import { XIcon } from "lucide-react"

import { ButtonLink } from "@/components/shared/button-link"
import { ProductSwatch } from "@/components/shared/product-swatch"
import { ProductPicker } from "@/features/compare/components/product-picker"
import {
  compareHref,
  MAX_COMPARED_PRODUCTS,
  SLOT_COLORS,
} from "@/features/compare/schemas"
import type { ComparedProduct, CompareOption } from "@/features/compare/types"

/** One card per selection slot, each keyed to its series color, plus the picker. */
export function SelectedProducts({
  products,
  options,
}: {
  products: ComparedProduct[]
  options: CompareOption[]
}) {
  const slugs = products.map((product) => product.slug)

  return (
    <ul
      aria-label="Selected products"
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
    >
      {products.map((product) => (
        <li
          key={product.slug}
          className="relative flex items-center gap-3 overflow-hidden rounded-xl bg-card p-3 pt-4 ring-1 ring-foreground/10"
        >
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-1"
            style={{ background: SLOT_COLORS[product.slot] }}
          />
          <ProductSwatch
            color={product.color}
            brand={product.brand_name}
            className="size-10 sm:size-12"
          />
          <div className="min-w-0 flex-1">
            <Link
              href={`/products/${product.slug}`}
              className="line-clamp-2 text-sm font-medium hover:underline"
            >
              {product.name}
            </Link>
            <div className="truncate text-xs text-muted-foreground">
              {product.brand_name} · {product.category_name}
            </div>
          </div>
          <ButtonLink
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove ${product.name}`}
            href={compareHref(slugs.filter((slug) => slug !== product.slug))}
            scroll={false}
            replace
          >
            <XIcon />
          </ButtonLink>
        </li>
      ))}
      {products.length < MAX_COMPARED_PRODUCTS && (
        <li>
          <ProductPicker options={options} selected={slugs} />
        </li>
      )}
    </ul>
  )
}
