import type { PricePoint, ProductOverview } from "@/features/products/types"

/** A catalog entry offered by the product picker. */
export type CompareOption = {
  slug: string
  name: string
  brand: string
  category: string
}

/** A selected product with its selection slot (drives its series color). */
export type ComparedProduct = ProductOverview & {
  slug: string
  slot: number
  history: PricePoint[]
}

export type Comparison = {
  options: CompareOption[]
  products: ComparedProduct[]
}
