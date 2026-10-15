"use client"

import { useEffect, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

const SEARCH_DEBOUNCE_MS = 300

/**
 * List filters stored in URL search params. Any change resets pagination;
 * the free-text `q` param is debounced while typing.
 */
export function useUrlFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [query, setQuery] = useState(searchParams.get("q") ?? "")

  function update(changes: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value)
      else params.delete(key)
    }
    params.delete("page")
    const search = params.toString()
    startTransition(() => {
      router.replace(search ? `${pathname}?${search}` : pathname, {
        scroll: false,
      })
    })
  }

  useEffect(() => {
    const current = searchParams.get("q") ?? ""
    if (query.trim() === current) return
    const timeout = setTimeout(
      () => update({ q: query.trim() || null }),
      SEARCH_DEBOUNCE_MS
    )
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to typing
  }, [query])

  function clear(keys: string[]) {
    setQuery("")
    update(Object.fromEntries(["q", ...keys].map((key) => [key, null])))
  }

  return { pending, query, setQuery, update, clear }
}
