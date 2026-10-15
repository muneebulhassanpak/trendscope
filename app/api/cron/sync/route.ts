import { timingSafeEqual } from "node:crypto"

import { serverEnv } from "@/lib/env.server"
import { runMarketSync } from "@/lib/market-data/sync"
import { createAdminClient } from "@/lib/supabase/admin"

export const maxDuration = 60

/** Scheduled market data sync. Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`. */
export async function GET(request: Request) {
  const secret = serverEnv.CRON_SECRET
  if (!secret || !isAuthorized(request.headers.get("authorization"), secret)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const summary = await runMarketSync(createAdminClient(), {
      trigger: "schedule",
    })
    return Response.json(summary)
  } catch (error) {
    console.error("Scheduled market sync failed", error)
    return Response.json({ error: "Sync failed" }, { status: 500 })
  }
}

function isAuthorized(header: string | null, secret: string) {
  const expected = Buffer.from(`Bearer ${secret}`)
  const received = Buffer.from(header ?? "")
  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  )
}
