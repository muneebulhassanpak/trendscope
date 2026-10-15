"use client"

import { useMemo, useState } from "react"
import { ChevronsUpDownIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"
import { ARTICLE_LIMITS } from "@/features/articles/schemas"
import type { ArticleProductOption } from "@/features/articles/types"

/**
 * Searchable, category-grouped multi-select. Selected products render as
 * removable chips and post as repeated `name` hidden inputs.
 */
export function ProductMultiSelect({
  id,
  name,
  options,
  value,
  onChange,
  invalid,
}: {
  id: string
  name: string
  options: ArticleProductOption[]
  value: string[]
  onChange: (value: string[]) => void
  invalid?: boolean
}) {
  const [open, setOpen] = useState(false)

  const byId = useMemo(
    () => new Map(options.map((option) => [option.id, option])),
    [options]
  )
  const groups = useMemo(() => {
    const map = new Map<string, ArticleProductOption[]>()
    for (const option of options) {
      map.set(option.category, [...(map.get(option.category) ?? []), option])
    }
    return [...map]
  }, [options])

  const selected = value.flatMap((productId) => byId.get(productId) ?? [])
  const atLimit = value.length >= ARTICLE_LIMITS.products

  function toggle(productId: string) {
    onChange(
      value.includes(productId)
        ? value.filter((current) => current !== productId)
        : [...value, productId]
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {value.map((productId) => (
        <input key={productId} type="hidden" name={name} value={productId} />
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              variant="outline"
              aria-invalid={invalid}
              className="w-full justify-between font-normal"
            />
          }
        >
          <span
            className={cn("truncate", !value.length && "text-muted-foreground")}
          >
            {value.length
              ? `${formatNumber(value.length)} linked`
              : "Link products…"}
          </span>
          <ChevronsUpDownIcon className="text-muted-foreground" aria-hidden />
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
              {groups.map(([category, items]) => (
                <CommandGroup key={category} heading={category}>
                  {items.map((option) => {
                    const isSelected = value.includes(option.id)
                    return (
                      <CommandItem
                        key={option.id}
                        value={option.id}
                        keywords={[option.name, option.brand, category]}
                        disabled={!isSelected && atLimit}
                        data-checked={isSelected}
                        onSelect={toggle}
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

      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Linked products">
          {selected.map((option) => (
            <li
              key={option.id}
              className="inline-flex max-w-full items-center gap-1 rounded-md bg-muted py-0.5 pr-0.5 pl-2 text-xs"
            >
              <span className="truncate">{option.name}</span>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Remove ${option.name}`}
                onClick={() => toggle(option.id)}
                className="size-5 text-muted-foreground"
              >
                <XIcon />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
