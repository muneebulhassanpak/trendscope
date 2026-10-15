"use client"

import { useActionState } from "react"
import { RefreshCwIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import type { ActionResult } from "@/lib/action-result"
import { formatNumber } from "@/lib/format"
import type { SyncSummary } from "@/lib/market-data/sync"
import { runSyncNow } from "@/features/sync/actions"

async function runAndNotify(): Promise<ActionResult<SyncSummary>> {
  const result = await runSyncNow()
  if (!result.ok) {
    toast.error(result.error)
  } else if (result.data.status === "skipped") {
    toast.warning("A sync is already running", {
      description: "Give it a moment, then check the history below.",
    })
  } else {
    const { products, pricePoints } = result.data
    toast.success("Market data synced", {
      description: `${formatNumber(products)} products checked · ${formatNumber(pricePoints)} new price ${pricePoints === 1 ? "point" : "points"}`,
    })
  }
  return result
}

export function RunSyncButton() {
  const [, action, pending] = useActionState(runAndNotify, null)

  return (
    <form action={action}>
      <Button type="submit" disabled={pending}>
        {pending ? <Spinner /> : <RefreshCwIcon />}
        {pending ? "Syncing…" : "Run sync now"}
      </Button>
    </form>
  )
}
