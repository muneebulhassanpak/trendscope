import Link from "next/link"
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChangeBadge } from "@/components/shared/change-badge"
import { ProductSwatch } from "@/components/shared/product-swatch"
import { Sparkline } from "@/components/shared/sparkline"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { ProductFilters, ProductSort } from "@/features/products/schemas"
import type { ProductListItem } from "@/features/products/types"

type Column = {
  key: ProductSort
  label: string
  className?: string
}

const COLUMNS: Column[] = [
  { key: "price", label: "Price", className: "text-right" },
  { key: "change_7d_pct", label: "7d", className: "text-right" },
  { key: "change_30d_pct", label: "30d", className: "text-right" },
  {
    key: "change_1y_pct",
    label: "1y",
    className: "text-right hidden xl:table-cell",
  },
  { key: "premium_pct", label: "vs retail", className: "text-right" },
]

export function ProductTable({
  products,
  filters,
}: {
  products: ProductListItem[]
  filters: ProductFilters
}) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl ring-1 ring-foreground/10 md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">
                <SortLink
                  column={{ key: "name", label: "Product" }}
                  filters={filters}
                />
              </TableHead>
              <TableHead className="hidden lg:table-cell">Category</TableHead>
              {COLUMNS.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  <SortLink column={column} filters={filters} />
                </TableHead>
              ))}
              <TableHead className="hidden pr-4 text-right lg:table-cell">
                30 days
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="group relative">
                <TableCell className="pl-4">
                  <div className="flex items-center gap-3">
                    <ProductSwatch
                      color={product.color}
                      brand={product.brand_name}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <Link
                        href={`/products/${product.slug}`}
                        className="block truncate font-medium group-hover:underline after:absolute after:inset-0"
                      >
                        {product.name}
                      </Link>
                      <div className="truncate text-xs text-muted-foreground">
                        {product.brand_name} · {product.color}{" "}
                        {product.material}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">
                  {product.category_name}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatPrice(product.latest_price)}
                </TableCell>
                <TableCell className="text-right">
                  <ChangeBadge value={product.change_7d_pct} />
                </TableCell>
                <TableCell className="text-right">
                  <ChangeBadge value={product.change_30d_pct} />
                </TableCell>
                <TableCell className="hidden text-right xl:table-cell">
                  <ChangeBadge value={product.change_1y_pct} />
                </TableCell>
                <TableCell className="text-right">
                  <ChangeBadge value={product.premium_pct} />
                </TableCell>
                <TableCell className="hidden pr-4 lg:table-cell">
                  <Sparkline
                    values={product.sparkline.map((point) => point.price)}
                    className="ml-auto"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="flex flex-col gap-2 md:hidden">
        {products.map((product) => (
          <li key={product.id}>
            <Link
              href={`/products/${product.slug}`}
              className="flex items-center gap-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10"
            >
              <ProductSwatch
                color={product.color}
                brand={product.brand_name}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {product.name}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {product.brand_name} · {product.category_name}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium tabular-nums">
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
      </ul>
    </>
  )
}

function SortLink({
  column,
  filters,
}: {
  column: Column
  filters: ProductFilters
}) {
  const active = filters.sort === column.key
  const nextDir = active && filters.dir === "desc" ? "asc" : "desc"
  const params = new URLSearchParams()
  for (const key of ["q", "category", "brand", "color", "material"] as const) {
    const value = filters[key]
    if (value) params.set(key, value)
  }
  params.set("sort", column.key)
  params.set("dir", column.key === "name" && !active ? "asc" : nextDir)

  const Icon = !active
    ? ChevronsUpDownIcon
    : filters.dir === "asc"
      ? ArrowUpIcon
      : ArrowDownIcon

  return (
    <Link
      href={`/products?${params}`}
      scroll={false}
      aria-label={`Sort by ${column.label}`}
      className={cn(
        "inline-flex items-center gap-1 hover:text-foreground",
        active ? "text-foreground" : "text-muted-foreground"
      )}
    >
      {column.label}
      <Icon className="size-3.5" aria-hidden />
    </Link>
  )
}
