"use client"

import { useOptimistic, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import {
  isPeriodRanking,
  RANKING_PERIODS,
  RANKING_TYPES,
  type RankingFilters,
  type RankingPeriod,
  type RankingType,
} from "@/features/rankings/schemas"
import type { RankingCategory } from "@/features/rankings/types"

const ALL = "all"
const DEFAULTS = { type: "gainers", period: "30d" } as const

/**
 * Ranking type tabs, period and category filters. State lives in the URL; the
 * server-rendered leaderboard is passed in as the active tab panel.
 */
export function RankingControls({
  filters,
  categories,
  children,
}: {
  filters: RankingFilters
  categories: RankingCategory[]
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()
  const [optimistic, setOptimistic] = useOptimistic(filters)

  function update(changes: Partial<RankingFilters>) {
    const next = { ...optimistic, ...changes }
    const params = new URLSearchParams()
    if (next.type !== DEFAULTS.type) params.set("type", next.type)
    if (next.period !== DEFAULTS.period) params.set("period", next.period)
    if (next.category) params.set("category", next.category)
    const search = params.toString()
    startTransition(() => {
      setOptimistic(next)
      router.replace(search ? `${pathname}?${search}` : pathname, {
        scroll: false,
      })
    })
  }

  const categoryItems = [{ value: ALL, label: "All categories" }, ...categories]

  return (
    <Tabs
      value={optimistic.type}
      onValueChange={(value) => update({ type: value as RankingType })}
      className="gap-4"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <TabsList aria-label="Ranking type" className="w-full sm:w-fit">
          {(Object.keys(RANKING_TYPES) as RankingType[]).map((type) => (
            <TabsTrigger key={type} value={type} className="px-2.5">
              <span className="sm:hidden">
                {RANKING_TYPES[type].shortLabel}
              </span>
              <span className="hidden sm:inline">
                {RANKING_TYPES[type].label}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex items-center justify-between gap-3 sm:justify-start">
          {isPeriodRanking(optimistic.type) && (
            <ToggleGroup
              variant="outline"
              size="sm"
              value={[optimistic.period]}
              onValueChange={(value) =>
                value[0] && update({ period: value[0] as RankingPeriod })
              }
              aria-label="Ranking period"
            >
              {(Object.keys(RANKING_PERIODS) as RankingPeriod[]).map(
                (period) => (
                  <ToggleGroupItem
                    key={period}
                    value={period}
                    aria-label={`Change over ${RANKING_PERIODS[period]}`}
                  >
                    {period}
                  </ToggleGroupItem>
                )
              )}
            </ToggleGroup>
          )}
          <Select
            items={categoryItems}
            value={optimistic.category ?? ALL}
            onValueChange={(value) =>
              update({
                category: value && value !== ALL ? String(value) : undefined,
              })
            }
          >
            <SelectTrigger
              aria-label="Category"
              size="sm"
              className="ml-auto w-40 sm:ml-0"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <TabsContent
        value={optimistic.type}
        aria-busy={pending}
        className={cn(
          "flex flex-col gap-3 transition-opacity",
          pending && "opacity-60"
        )}
      >
        {children}
      </TabsContent>
    </Tabs>
  )
}
