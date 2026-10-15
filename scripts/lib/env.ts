import { existsSync } from "node:fs"

/**
 * Load .env.local then .env for local runs (first value wins). In CI the
 * variables come from the environment and no files exist.
 */
for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file)
}

export function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable ${name}`)
  return value
}
