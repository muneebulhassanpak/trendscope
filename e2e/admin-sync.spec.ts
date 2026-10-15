import { expect, test, type Page } from "@playwright/test"

import { signInAsAdmin, signInAsDemo } from "./helpers/auth"

const historyRows = (page: Page) =>
  page.getByRole("table", { name: "Sync history" }).locator("tbody tr")

test("shows provider overview, pipeline and run history", async ({ page }) => {
  await signInAsAdmin(page, "/admin/sync")
  const main = page.getByRole("main")

  await expect(
    main.getByRole("heading", { level: 1, name: "Data Sync" })
  ).toBeVisible()
  await expect(main.getByText("Demo market API").first()).toBeVisible()
  await expect(main.getByText("Price points tracked")).toBeVisible()
  await expect(
    main.getByRole("list", { name: "Sync pipeline" }).getByRole("listitem")
  ).toHaveCount(4)
  await expect(historyRows(page).first()).toBeVisible()
})

test("admin runs a sync and a new run tops the history", async ({ page }) => {
  await signInAsAdmin(page, "/admin/sync")
  const newest = historyRows(page).first()
  await expect(newest).toBeVisible()
  const previousTop = await newest.textContent()

  await page.getByRole("button", { name: "Run sync now" }).click()
  await expect(page.getByText("Market data synced")).toBeVisible({
    timeout: 30_000,
  })

  await expect(newest).not.toHaveText(previousTop ?? "")
  await expect(newest).toContainText("Success")
  await expect(newest).toContainText("Manual")
  await expect(page.getByRole("main").getByText("just now")).toBeVisible()
})

test("demo account cannot run a sync", async ({ page }) => {
  await signInAsDemo(page, "/admin/sync")
  await expect(page.getByText("Read-only demo")).toBeVisible()

  await page.getByRole("button", { name: "Run sync now" }).click()
  await expect(
    page.getByText(
      "Demo mode is read-only — changes are disabled for this account."
    )
  ).toBeVisible()
})
