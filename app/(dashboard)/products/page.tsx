import type { Metadata } from "next"
import { SearchXIcon } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { PageHeader } from "@/components/shared/page-header"
import { ProductFilters } from "@/features/products/components/product-filters"
import { ProductTable } from "@/features/products/components/product-table"
import {
  listProductFilterOptions,
  listProducts,
} from "@/features/products/queries"
import { parseProductFilters } from "@/features/products/schemas"

export const metadata: Metadata = { title: "Products" }

export default async function ProductsPage({
  searchParams,
}: PageProps<"/products">) {
  const filters = parseProductFilters(await searchParams)
  const [products, options] = await Promise.all([
    listProducts(filters),
    listProductFilterOptions(),
  ])

  return (
    <>
      <PageHeader
        title="Products"
        description="Every tracked product with live resale pricing and momentum."
      />
      <ProductFilters options={options} />
      <p className="-mt-2 text-sm text-muted-foreground" aria-live="polite">
        {products.length} {products.length === 1 ? "product" : "products"}
      </p>
      {products.length ? (
        <ProductTable products={products} filters={filters} />
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchXIcon />
            </EmptyMedia>
            <EmptyTitle>No matching products</EmptyTitle>
            <EmptyDescription>
              Try a different search term or clear some filters.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </>
  )
}
