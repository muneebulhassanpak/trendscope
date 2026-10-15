"use client"

import { useEffect, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
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
import type { ProductFilterOptions } from "@/features/products/types"

const ALL = "all"
const FILTER_KEYS = ["category", "brand", "color", "material"] as const
type FilterKey = (typeof FILTER_KEYS)[number]

const LABELS: Record<FilterKey, string> = {
  category: "All categories",
  brand: "All brands",
  color: "All colors",
  material: "All materials",
}

export function ProductFilters({ options }: { options: ProductFilterOptions }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [query, setQuery] = useState(searchParams.get("q") ?? "")

  const optionsByKey: Record<
    FilterKey,
    ProductFilterOptions[keyof ProductFilterOptions]
  > = {
    category: options.categories,
    brand: options.brands,
    color: options.colors,
    material: options.materials,
  }

  function update(changes: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value)
      else params.delete(key)
    }
    const search = params.toString()
    startTransition(() => {
      router.replace(search ? `${pathname}?${search}` : pathname, {
        scroll: false,
      })
    })
  }

  // Debounce free-text search into the URL.
  useEffect(() => {
    const current = searchParams.get("q") ?? ""
    if (query.trim() === current) return
    const timeout = setTimeout(() => update({ q: query.trim() || null }), 300)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to typing
  }, [query])

  const hasFilters =
    Boolean(searchParams.get("q")) ||
    FILTER_KEYS.some((key) => searchParams.get(key))

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <InputGroup className="lg:max-w-xs">
        <InputGroupAddon>
          {pending ? <Spinner /> : <SearchIcon />}
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          placeholder="Search name, color, material…"
          aria-label="Search products"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </InputGroup>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:flex">
        {FILTER_KEYS.map((key) => {
          const items = [
            { value: ALL, label: LABELS[key] },
            ...optionsByKey[key],
          ]
          return (
            <Select
              key={key}
              items={items}
              value={searchParams.get(key) ?? ALL}
              onValueChange={(value) =>
                update({ [key]: value && value !== ALL ? String(value) : null })
              }
            >
              <SelectTrigger
                aria-label={LABELS[key]}
                className="w-full lg:w-40"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {items.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        })}
      </div>

      {hasFilters && (
        <Button
          variant="ghost"
          onClick={() => {
            setQuery("")
            update({
              q: null,
              category: null,
              brand: null,
              color: null,
              material: null,
            })
          }}
        >
          <XIcon />
          Clear
        </Button>
      )}
    </div>
  )
}
