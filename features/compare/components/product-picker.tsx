"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { PlusIcon } from "lucide-react"

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
import { Spinner } from "@/components/ui/spinner"
import { compareHref, MAX_COMPARED_PRODUCTS } from "@/features/compare/schemas"
import type { CompareOption } from "@/features/compare/types"

/** Searchable combobox that appends a product to the comparison URL. */
export function ProductPicker({
  options,
  selected,
}: {
  options: CompareOption[]
  selected: string[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  const groups = new Map<string, CompareOption[]>()
  for (const option of options) {
    groups.set(option.category, [
      ...(groups.get(option.category) ?? []),
      option,
    ])
  }
  const remaining = MAX_COMPARED_PRODUCTS - selected.length

  function add(slug: string) {
    setOpen(false)
    startTransition(() => {
      router.replace(compareHref([...selected, slug]), { scroll: false })
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={pending}
        className="flex h-full min-h-16 w-full items-center justify-center gap-2 rounded-xl border border-dashed text-sm font-medium text-muted-foreground transition-colors outline-none hover:border-foreground/30 hover:bg-muted/40 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-expanded:bg-muted/40 aria-expanded:text-foreground"
      >
        {pending ? <Spinner /> : <PlusIcon className="size-4" aria-hidden />}
        Add product
        <span className="text-xs font-normal">
          {remaining} {remaining === 1 ? "slot" : "slots"} left
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-w-[calc(100vw-2rem)] p-0">
        <Command loop>
          <CommandInput
            placeholder="Search products…"
            aria-label="Search products"
          />
          <CommandList>
            <CommandEmpty>No products found.</CommandEmpty>
            {[...groups].map(([category, items]) => (
              <CommandGroup key={category} heading={category}>
                {items.map((option) => {
                  const isSelected = selected.includes(option.slug)
                  return (
                    <CommandItem
                      key={option.slug}
                      value={option.slug}
                      keywords={[option.name, option.brand, category]}
                      disabled={isSelected}
                      data-checked={isSelected}
                      onSelect={add}
                    >
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate">{option.name}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {option.brand}
                        </span>
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
