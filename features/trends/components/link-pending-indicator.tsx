"use client"

import { useLinkStatus } from "next/link"

import { cn } from "@/lib/utils"

/** Fixed-size dot inside a `<Link>` that pulses while its navigation is pending. */
export function LinkPendingIndicator() {
  const { pending } = useLinkStatus()
  return (
    <span
      aria-hidden
      className={cn(
        "absolute top-1 right-1 size-1.5 rounded-full bg-current opacity-0 transition-opacity",
        pending && "animate-pulse opacity-60"
      )}
    />
  )
}
