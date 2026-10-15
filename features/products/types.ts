import type { Tables } from "@/lib/supabase/database.types"

export type ProductOverview = Tables<"product_overview">

export type PricePoint = { date: string; price: number }

export type ProductListItem = ProductOverview & { sparkline: PricePoint[] }

export type FilterOption = { value: string; label: string }

export type ProductFilterOptions = {
  categories: FilterOption[]
  brands: FilterOption[]
  colors: FilterOption[]
  materials: FilterOption[]
}
