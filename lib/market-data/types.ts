/**
 * Contract between the sync job and an external market data source.
 * Swap the demo provider for a real API by implementing this interface.
 */
export type CatalogProduct = {
  externalId: string
  name: string
  slug: string
  brand: { name: string; slug: string }
  category: { name: string; slug: string }
  color: string
  material: string
  retailPrice: number
  releaseDate: string
  description: string
}

export type PricePoint = {
  externalId: string
  /** ISO date, YYYY-MM-DD (UTC) */
  date: string
  price: number
}

export interface MarketDataProvider {
  readonly name: string
  getCatalog(): Promise<CatalogProduct[]>
  /** Daily prices for one product, inclusive of both ISO dates. */
  getPriceHistory(
    product: CatalogProduct,
    from: string,
    to: string
  ): Promise<PricePoint[]>
}
