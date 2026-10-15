import { existsSync } from "node:fs"

import { defineConfig, devices } from "@playwright/test"

// Test helpers read seeded credentials (ADMIN_EMAIL, ...) from the local env.
for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file)
}

const isCI = Boolean(process.env.CI)
const port = Number(process.env.E2E_PORT ?? 3000)

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /.*\.mobile\.spec\.ts/,
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
      testMatch: /.*\.mobile\.spec\.ts/,
    },
  ],
  webServer: {
    // CI runs against the production build; locally reuse a running dev server.
    command: isCI ? `npx next start -p ${port}` : `npx next dev -p ${port}`,
    port,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
})
