"use client"

import { useState } from "react"
import { ChevronsUpDownIcon } from "lucide-react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ProductSwatch } from "@/components/shared/product-swatch"
import type { ObservationProductOption } from "@/features/observations/types"

/** Searchable single-product picker; submits the product id as `name`. */
export function ProductCombobox({
  id,
  name,
  options,
  defaultValue,
  invalid,
}: {
  id: string
  name: string
  options: ObservationProductOption[]
  defaultValue?: string
  invalid?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(defaultValue ?? "")
  const selected = options.find((option) => option.id === value)

  const groups = new Map<string, ObservationProductOption[]>()
  for (const option of options) {
    groups.set(option.category, [
      ...(groups.get(option.category) ?? []),
      option,
    ])
  }

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          id={id}
          aria-invalid={invalid}
          className="flex h-10 w-full items-center gap-2.5 rounded-lg border border-input bg-transparent px-2 text-left text-sm transition-colors outline-none hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
        >
          {selected ? (
            <>
              <ProductSwatch
                color={selected.color}
                brand={selected.brand}
                size="sm"
                className="size-7 rounded-md text-[0.625rem]"
              />
              <span className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="truncate font-medium">{selected.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {selected.brand} · {selected.category}
                </span>
              </span>
            </>
          ) : (
            <span className="flex-1 pl-0.5 text-muted-foreground">
              Choose a product…
            </span>
          )}
          <ChevronsUpDownIcon
            aria-hidden
            className="size-4 shrink-0 text-muted-foreground"
          />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-(--anchor-width) max-w-[calc(100vw-2rem)] min-w-72 p-0"
        >
          <Command loop>
            <CommandInput
              placeholder="Search products…"
              aria-label="Search products"
            />
            <CommandList>
              <CommandEmpty>No products found.</CommandEmpty>
              {[...groups].map(([category, items]) => (
                <CommandGroup key={category} heading={category}>
                  {items.map((option) => (
                    <CommandItem
                      key={option.id}
                      value={option.id}
                      keywords={[option.name, option.brand, category]}
                      data-checked={option.id === value}
                      onSelect={(id) => {
                        setValue(id)
                        setOpen(false)
                      }}
                    >
                      <ProductSwatch
                        color={option.color}
                        brand={option.brand}
                        size="sm"
                        className="size-6 rounded-md text-[0.5625rem]"
                      />
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate">{option.name}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {option.brand}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  )
}
