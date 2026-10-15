import type { Metadata } from "next"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { CompareChart } from "@/features/compare/components/compare-chart"
import { CompareEmpty } from "@/features/compare/components/compare-empty"
import { CompareTable } from "@/features/compare/components/compare-table"
import { SelectedProducts } from "@/features/compare/components/selected-products"
import { getComparison } from "@/features/compare/queries"
import {
  MAX_COMPARED_PRODUCTS,
  parseCompareSlugs,
} from "@/features/compare/schemas"

export const metadata: Metadata = { title: "Compare" }

export default async function ComparePage({
  searchParams,
}: PageProps<"/compare">) {
  const { options, products } = await getComparison(
    parseCompareSlugs(await searchParams)
  )

  return (
    <>
      <PageHeader
        title="Compare"
        description={`Compare up to ${MAX_COMPARED_PRODUCTS} products side by side.`}
      />
      <SelectedProducts products={products} options={options} />

      {products.length ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Price performance</CardTitle>
              <CardDescription>
                % change in resale price from the start of the period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompareChart
                series={products.map((product) => ({
                  slug: product.slug,
                  name: product.name ?? product.slug,
                  slot: product.slot,
                  history: product.history,
                }))}
              />
            </CardContent>
          </Card>

          <section
            aria-labelledby="compare-details"
            className="flex flex-col gap-3"
          >
            <h2 id="compare-details" className="font-medium">
              Side by side
            </h2>
            <CompareTable products={products} />
          </section>
        </>
      ) : (
        <CompareEmpty options={options} />
      )}
    </>
  )
}
