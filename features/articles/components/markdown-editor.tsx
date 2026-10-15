"use client"

import { useDeferredValue, useState } from "react"
import { EyeIcon, PencilLineIcon } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Markdown } from "@/components/shared/markdown"
import { cn } from "@/lib/utils"

type View = "write" | "preview"

/**
 * Markdown body with a Write/Preview tab pair; from `xl` both panes sit side
 * by side. The preview mirrors the public report (title, excerpt, body) and
 * goes through the shared, sanitizing `Markdown` renderer.
 */
export function MarkdownEditor({
  id,
  name,
  value,
  onChange,
  title,
  excerpt,
  invalid,
  describedBy,
}: {
  id: string
  name: string
  value: string
  onChange: (value: string) => void
  title: string
  excerpt: string
  invalid?: boolean
  describedBy?: string
}) {
  const [view, setView] = useState<View>("write")
  // Keeps typing responsive on long articles; the preview catches up.
  const preview = useDeferredValue(value)

  return (
    <Tabs
      value={view}
      onValueChange={(next) => setView(next as View)}
      className={cn(
        "gap-0 overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-shadow has-[textarea:focus-visible]:ring-ring/60",
        invalid && "ring-destructive/60"
      )}
    >
      <div className="flex h-11 items-center justify-between gap-3 border-b px-3 sm:px-4">
        <label
          htmlFor={id}
          className="flex items-baseline gap-2 text-sm font-medium"
        >
          Body
          <span className="text-xs font-normal text-muted-foreground">
            Markdown
          </span>
        </label>
        <TabsList aria-label="Editor view" className="xl:hidden">
          <TabsTrigger value="write" className="px-2.5">
            <PencilLineIcon aria-hidden />
            Write
          </TabsTrigger>
          <TabsTrigger value="preview" className="px-2.5">
            <EyeIcon aria-hidden />
            Preview
          </TabsTrigger>
        </TabsList>
        <span className="hidden text-xs text-muted-foreground xl:inline">
          Live preview
        </span>
      </div>

      <div className="grid xl:grid-cols-2 xl:divide-x">
        {/*
         * Both panels stay mounted and visible on wide screens; below `xl`
         * only the active one shows (`data-hidden` comes from Base UI).
         */}
        <TabsContent
          value="write"
          keepMounted
          hidden={false}
          className="min-w-0 data-hidden:max-xl:hidden"
        >
          <Textarea
            id={id}
            name={name}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            placeholder={
              "## Start with a heading\n\nWrite in Markdown — **bold**, _italic_, lists, links and tables."
            }
            spellCheck
            className="min-h-80 resize-none rounded-none border-0 bg-transparent px-3 py-3 font-mono text-base leading-7 focus-visible:ring-0 aria-invalid:ring-0 sm:min-h-[28rem] sm:px-4 md:text-[13px] md:leading-6 dark:bg-transparent"
          />
        </TabsContent>
        <TabsContent
          value="preview"
          keepMounted
          hidden={false}
          className="min-w-0 bg-background/40 data-hidden:max-xl:hidden"
        >
          <div className="flex flex-col gap-3 px-4 py-5 sm:px-6">
            <div className="text-2xl font-semibold tracking-tight text-balance">
              {title.trim() || (
                <span className="text-muted-foreground">Untitled article</span>
              )}
            </div>
            {excerpt.trim() && (
              <p className="leading-relaxed text-pretty text-muted-foreground">
                {excerpt}
              </p>
            )}
            <div className="mt-3 border-t pt-6">
              {preview.trim() ? (
                <Markdown>{preview}</Markdown>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nothing to preview yet.
                </p>
              )}
            </div>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  )
}
