"use client"

import { SearchIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { useUrlFilters } from "@/hooks/use-url-filters"
import type { ObservationFilters as Filters } from "@/features/observations/schemas"
import type { ObservationProductOption } from "@/features/observations/types"

const ALL = "all"

export function ObservationFilters({
  filters,
  products,
  tags,
}: {
  filters: Filters
  products: ObservationProductOption[]
  tags: string[]
}) {
  const { pending, query, setQuery, update, clear } = useUrlFilters()
  const { product, tag } = filters
  const hasFilters = Boolean(filters.q || product || tag)

  const productItems = [
    { value: ALL, label: "All products" },
    ...products.map((option) => ({ value: option.slug, label: option.name })),
  ]
  // Keep a tag from the URL selectable even if it is not in the recent list.
  const tagItems = [
    { value: ALL, label: "All tags" },
    ...[...new Set([...tags, ...(tag ? [tag] : [])])].map((value) => ({
      value,
      label: value,
    })),
  ]

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <InputGroup className="lg:max-w-xs">
        <InputGroupAddon>
          {pending ? <Spinner /> : <SearchIcon />}
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          placeholder="Search notes…"
          aria-label="Search observations"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </InputGroup>
      <div className="grid grid-cols-2 gap-3 lg:flex">
        <Select
          items={productItems}
          value={product ?? ALL}
          onValueChange={(value) =>
            update({ product: value && value !== ALL ? String(value) : null })
          }
        >
          <SelectTrigger
            aria-label="Filter by product"
            className="w-full min-w-0 lg:w-56"
          >
            <SelectValue className="truncate" />
          </SelectTrigger>
          <SelectContent>
            {productItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          items={tagItems}
          value={tag ?? ALL}
          onValueChange={(value) =>
            update({ tag: value && value !== ALL ? String(value) : null })
          }
        >
          <SelectTrigger
            aria-label="Filter by tag"
            className="w-full min-w-0 lg:w-40"
          >
            <SelectValue className="truncate" />
          </SelectTrigger>
          <SelectContent>
            {tagItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {hasFilters && (
        <Button variant="ghost" onClick={() => clear(["product", "tag"])}>
          <XIcon />
          Clear
        </Button>
      )}
    </div>
  )
}
