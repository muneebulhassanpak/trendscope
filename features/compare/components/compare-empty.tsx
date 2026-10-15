import Link from "next/link"
import { ArrowRightIcon, GitCompareArrowsIcon } from "lucide-react"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { compareHref } from "@/features/compare/schemas"
import type { CompareOption } from "@/features/compare/types"

const SUGGESTIONS = [
  {
    title: "Rolex icons",
    slugs: [
      "rolex-submariner-126610ln",
      "rolex-daytona-126500ln",
      "rolex-gmt-master-ii-pepsi",
    ],
  },
  {
    title: "Hermès vs Chanel",
    slugs: [
      "hermes-birkin-30-togo",
      "hermes-kelly-28-epsom",
      "chanel-classic-flap-medium",
    ],
  },
  {
    title: "Terrace classics",
    slugs: [
      "adidas-samba-og-white",
      "adidas-gazelle-indoor-blue",
      "nike-dunk-low-panda",
    ],
  },
]

/** Shown with nothing selected: curated starting points (only known products). */
export function CompareEmpty({ options }: { options: CompareOption[] }) {
  const names = new Map(options.map((option) => [option.slug, option.name]))
  const suggestions = SUGGESTIONS.map((suggestion) => ({
    ...suggestion,
    slugs: suggestion.slugs.filter((slug) => names.has(slug)),
  })).filter((suggestion) => suggestion.slugs.length >= 2)

  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <GitCompareArrowsIcon />
        </EmptyMedia>
        <EmptyTitle>Nothing to compare yet</EmptyTitle>
        <EmptyDescription>
          Add up to three products above, or start from one of these.
        </EmptyDescription>
      </EmptyHeader>
      {suggestions.length > 0 && (
        <EmptyContent className="max-w-2xl">
          <ul className="grid w-full gap-3 sm:grid-cols-3">
            {suggestions.map((suggestion) => (
              <li key={suggestion.title}>
                <Link
                  href={compareHref(suggestion.slugs)}
                  className="group flex h-full flex-col gap-2 rounded-xl bg-card p-3 text-left ring-1 ring-foreground/10 transition-colors hover:bg-muted/50"
                >
                  <span className="flex items-center justify-between gap-2 text-sm font-medium">
                    {suggestion.title}
                    <ArrowRightIcon
                      aria-hidden
                      className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                  <span className="text-xs leading-relaxed text-muted-foreground">
                    {suggestion.slugs
                      .map((slug) => names.get(slug))
                      .join(" · ")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </EmptyContent>
      )}
    </Empty>
  )
}
