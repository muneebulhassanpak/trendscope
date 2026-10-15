import { defineConfig, devices } from "@playwright/test"

const isCI = Boolean(process.env.CI)
const port = 3000

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
    command: isCI ? "npm run start" : "npm run dev",
    port,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
})
