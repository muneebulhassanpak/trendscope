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
import {
  SOURCE_TYPE_LABELS,
  SOURCE_TYPES,
  type SourceFilters as Filters,
} from "@/features/sources/schemas"

const ALL = "all"
const TYPE_ITEMS = [
  { value: ALL, label: "All types" },
  ...SOURCE_TYPES.map((type) => ({
    value: type,
    label: SOURCE_TYPE_LABELS[type],
  })),
]

export function SourceFilters({ filters }: { filters: Filters }) {
  const { pending, query, setQuery, update, clear } = useUrlFilters()
  const hasFilters = Boolean(filters.q || filters.type)

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <InputGroup className="sm:max-w-xs">
        <InputGroupAddon>
          {pending ? <Spinner /> : <SearchIcon />}
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          placeholder="Search titles…"
          aria-label="Search sources"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </InputGroup>
      <Select
        items={TYPE_ITEMS}
        value={filters.type ?? ALL}
        onValueChange={(value) =>
          update({ type: value && value !== ALL ? String(value) : null })
        }
      >
        <SelectTrigger aria-label="Filter by type" className="w-full sm:w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TYPE_ITEMS.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasFilters && (
        <Button variant="ghost" onClick={() => clear(["type"])}>
          <XIcon />
          Clear
        </Button>
      )}
    </div>
  )
}
