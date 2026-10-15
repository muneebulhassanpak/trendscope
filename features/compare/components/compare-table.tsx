import Link from "next/link"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChangeBadge } from "@/components/shared/change-badge"
import { formatDate, formatPrice } from "@/lib/format"
import { SLOT_COLORS } from "@/features/compare/schemas"
import type { ComparedProduct } from "@/features/compare/types"

type Metric = {
  label: string
  render: (product: ComparedProduct) => React.ReactNode
}

const yearPrices = (product: ComparedProduct) =>
  product.history.map((point) => point.price)

const METRICS: Metric[] = [
  {
    label: "Last price",
    render: (p) => (
      <span className="font-medium">{formatPrice(p.latest_price)}</span>
    ),
  },
  { label: "Retail price", render: (p) => formatPrice(p.retail_price) },
  {
    label: "Premium vs retail",
    render: (p) => <ChangeBadge value={p.premium_pct} />,
  },
  {
    label: "7d change",
    render: (p) => <ChangeBadge value={p.change_7d_pct} />,
  },
  {
    label: "30d change",
    render: (p) => <ChangeBadge value={p.change_30d_pct} />,
  },
  {
    label: "1y change",
    render: (p) => <ChangeBadge value={p.change_1y_pct} />,
  },
  {
    label: "1y high",
    render: (p) => {
      const prices = yearPrices(p)
      return prices.length ? formatPrice(Math.max(...prices)) : "—"
    },
  },
  {
    label: "1y low",
    render: (p) => {
      const prices = yearPrices(p)
      return prices.length ? formatPrice(Math.min(...prices)) : "—"
    },
  },
  { label: "Category", render: (p) => p.category_name ?? "—" },
  { label: "Color", render: (p) => p.color ?? "—" },
  { label: "Material", render: (p) => p.material ?? "—" },
  {
    label: "Released",
    render: (p) => (p.release_date ? formatDate(p.release_date) : "—"),
  },
]

/** Metrics as rows, products as columns; scrolls inside its container on mobile. */
export function CompareTable({ products }: { products: ComparedProduct[] }) {
  return (
    <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <Table
        className="table-fixed"
        style={{ minWidth: `${8 + products.length * 10}rem` }}
      >
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="sticky left-0 z-10 w-32 bg-card pl-4 sm:w-40">
              <span className="sr-only">Metric</span>
            </TableHead>
            {products.map((product) => (
              <TableHead
                key={product.slug}
                scope="col"
                className="h-auto py-3 align-top whitespace-normal"
              >
                <div className="flex items-start gap-2">
                  <span
                    aria-hidden
                    className="mt-1.5 h-0.5 w-3 shrink-0 rounded-full"
                    style={{ background: SLOT_COLORS[product.slot] }}
                  />
                  <Link
                    href={`/products/${product.slug}`}
                    className="line-clamp-2 font-medium text-foreground hover:underline"
                  >
                    {product.name}
                  </Link>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {METRICS.map((metric) => (
            <TableRow key={metric.label}>
              <TableHead
                scope="row"
                className="sticky left-0 z-10 bg-card pl-4 font-normal whitespace-normal text-muted-foreground"
              >
                {metric.label}
              </TableHead>
              {products.map((product) => (
                <TableCell key={product.slug} className="tabular-nums">
                  {metric.render(product)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
