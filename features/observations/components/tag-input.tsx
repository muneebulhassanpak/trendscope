"use client"

import { useState } from "react"
import { XIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { MAX_TAGS, normalizeTag } from "@/features/observations/schemas"

/**
 * Chip-style tag editor. Enter or comma commits a tag (normalized to a
 * lowercase slug), Backspace on an empty input removes the last one. Values
 * are submitted as repeated hidden `name` inputs.
 */
export function TagInput({
  id,
  name,
  defaultValue = [],
  invalid,
  describedBy,
}: {
  id: string
  name: string
  defaultValue?: string[]
  invalid?: boolean
  describedBy?: string
}) {
  const [tags, setTags] = useState(defaultValue)
  const [draft, setDraft] = useState("")
  const full = tags.length >= MAX_TAGS

  function commit(raw: string) {
    const additions = raw
      .split(",")
      .map(normalizeTag)
      .filter((tag) => tag && !tags.includes(tag))
    if (additions.length) {
      setTags([...new Set([...tags, ...additions])].slice(0, MAX_TAGS))
    }
    setDraft("")
  }

  function remove(tag: string) {
    setTags(tags.filter((t) => t !== tag))
  }

  return (
    <div
      className={cn(
        "flex min-h-8 w-full flex-wrap items-center gap-1.5 rounded-lg border border-input bg-transparent px-2 py-1 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30",
        invalid &&
          "border-destructive ring-3 ring-destructive/20 dark:border-destructive/50 dark:ring-destructive/40"
      )}
    >
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="h-6 gap-0.5 pr-0.5">
          {tag}
          <button
            type="button"
            onClick={() => remove(tag)}
            aria-label={`Remove tag ${tag}`}
            className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-foreground/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <XIcon />
          </button>
          <input type="hidden" name={name} value={tag} />
        </Badge>
      ))}
      <input
        id={id}
        value={draft}
        disabled={full}
        placeholder={
          full ? `Max ${MAX_TAGS} tags` : tags.length ? "" : "restock, auction…"
        }
        aria-invalid={invalid}
        aria-describedby={describedBy}
        autoComplete="off"
        enterKeyHint="enter"
        className="h-6 min-w-24 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed md:text-sm"
        onChange={(event) => {
          const value = event.target.value
          if (value.includes(",")) commit(value)
          else setDraft(value)
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault()
            commit(draft)
          } else if (event.key === "Backspace" && !draft && tags.length) {
            remove(tags[tags.length - 1])
          }
        }}
        onBlur={() => draft && commit(draft)}
      />
    </div>
  )
}
