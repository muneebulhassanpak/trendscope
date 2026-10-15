import type { Tables } from "@/lib/supabase/database.types"

export type Observation = Tables<"observations">

type Product = Tables<"products">

/** The product an observation is about, with what the list needs to show it. */
export type ObservationProduct = Pick<
  Product,
  "id" | "name" | "slug" | "color"
> & {
  brand: string
}

/** A row in the admin observations table (also the edit form's initial values). */
export type ObservationListItem = Pick<
  Observation,
  "id" | "note" | "tags" | "observed_at"
> & {
  product: ObservationProduct
  sourceIds: string[]
}

/** A product offered by the observation form's picker and the list filter. */
export type ObservationProductOption = ObservationProduct & {
  category: string
}

export type ObservationListPage = {
  items: ObservationListItem[]
  total: number
  page: number
  pageCount: number
}
