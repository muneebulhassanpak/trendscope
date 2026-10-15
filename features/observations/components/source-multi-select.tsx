"use client"

import { useState } from "react"
import { ChevronsUpDownIcon, XIcon } from "lucide-react"

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
import { MAX_SOURCES_PER_OBSERVATION } from "@/features/observations/schemas"
import { SOURCE_TYPE_ICONS } from "@/features/sources/components/source-type-badge"
import { sourceDomain } from "@/features/sources/source-domain"
import type { SourceOption } from "@/features/sources/types"

/** Searchable multi-select of existing sources; submits repeated `name` ids. */
export function SourceMultiSelect({
  id,
  name,
  options,
  defaultValue = [],
  invalid,
}: {
  id: string
  name: string
  options: SourceOption[]
  defaultValue?: string[]
  invalid?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(defaultValue)
  const selected = options.filter((option) => value.includes(option.id))
  const full = value.length >= MAX_SOURCES_PER_OBSERVATION

  function toggle(sourceId: string) {
    setValue((current) =>
      current.includes(sourceId)
        ? current.filter((id) => id !== sourceId)
        : [...current, sourceId]
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {value.map((sourceId) => (
        <input key={sourceId} type="hidden" name={name} value={sourceId} />
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          id={id}
          aria-invalid={invalid}
          disabled={!options.length}
          className="flex h-8 w-full items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 text-left text-sm transition-colors outline-none hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:hover:bg-input/50"
        >
          <span
            className={cn("flex-1", !value.length && "text-muted-foreground")}
          >
            {!options.length
              ? "No sources yet"
              : value.length
                ? `${formatNumber(value.length)} linked`
                : "Link sources…"}
          </span>
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
              placeholder="Search sources…"
              aria-label="Search sources"
            />
            <CommandList>
              <CommandEmpty>No sources found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const Icon = SOURCE_TYPE_ICONS[option.type]
                  const checked = value.includes(option.id)
                  return (
                    <CommandItem
                      key={option.id}
                      value={option.id}
                      keywords={[option.title, sourceDomain(option.url)]}
                      data-checked={checked}
                      disabled={full && !checked}
                      onSelect={toggle}
                    >
                      <Icon aria-hidden className="text-muted-foreground" />
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate">{option.title}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {sourceDomain(option.url)}
                        </span>
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selected.length > 0 && (
        <ul aria-label="Linked sources" className="flex flex-col gap-1">
          {selected.map((source) => {
            const Icon = SOURCE_TYPE_ICONS[source.type]
            return (
              <li
                key={source.id}
                className="flex items-center gap-2 rounded-md bg-muted/50 py-1 pr-1 pl-2 text-sm"
              >
                <Icon
                  aria-hidden
                  className="size-3.5 shrink-0 text-muted-foreground"
                />
                <span className="min-w-0 flex-1 truncate">{source.title}</span>
                <button
                  type="button"
                  onClick={() => toggle(source.id)}
                  aria-label={`Unlink ${source.title}`}
                  className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-foreground/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <XIcon className="size-3.5" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
