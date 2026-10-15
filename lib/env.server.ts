import "server-only"

import { z } from "zod"

const serverSchema = z.object({
  SUPABASE_SECRET_KEY: z.string().min(1).optional(),
  CRON_SECRET: z.string().min(16).optional(),
  DEMO_USER_EMAIL: z.email().optional(),
  DEMO_USER_PASSWORD: z.string().min(12).optional(),
})

export const serverEnv = serverSchema.parse({
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY || undefined,
  CRON_SECRET: process.env.CRON_SECRET || undefined,
  DEMO_USER_EMAIL: process.env.DEMO_USER_EMAIL || undefined,
  DEMO_USER_PASSWORD: process.env.DEMO_USER_PASSWORD || undefined,
})
