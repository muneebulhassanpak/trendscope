import { expect, test, type Page } from "@playwright/test"

const rows = (page: Page) =>
  page.getByRole("list", { name: "Leaderboard" }).locator("> li")
const toNumber = (text: string) => Number(text.replace(/[^0-9.-]/g, ""))

test("top gainers by default, ranked by 30-day change", async ({ page }) => {
  await page.goto("/rankings")
  const main = page.getByRole("main")
  await expect(main.getByRole("tab", { name: "Top gainers" })).toHaveAttribute(
    "aria-selected",
    "true"
  )
  await expect(
    main.getByRole("heading", { level: 2, name: "Top gainers" })
  ).toBeVisible()
  await expect(
    main.getByText("All categories · 30 days", { exact: true })
  ).toBeVisible()

  const count = await rows(page).count()
  expect(count).toBeGreaterThan(0)
  expect(count).toBeLessThanOrEqual(10)

  const changes = await rows(page)
    .locator("span:has(> .sr-only)")
    .allInnerTexts()
  const values = changes.map(toNumber)
  expect(values.every((value) => value > 0)).toBe(true)
  expect(values).toEqual([...values].sort((a, b) => b - a))
})

test("tabs, period and category are reflected in the URL", async ({ page }) => {
  await page.goto("/rankings")
  const main = page.getByRole("main")

  await main.getByRole("tab", { name: "Top losers" }).click()
  await expect(page).toHaveURL(/type=losers/)
  await expect(
    main.getByRole("heading", { level: 2, name: "Top losers" })
  ).toBeVisible()
  for (const row of await rows(page).all()) {
    await expect(row).toContainText("Down")
  }

  await main.getByRole("button", { name: "Change over 7 days" }).click()
  await expect(page).toHaveURL(/period=7d/)
  await expect(
    main.getByText("All categories · 7 days", { exact: true })
  ).toBeVisible()

  await main.getByRole("tab", { name: "Highest premium" }).click()
  await expect(page).toHaveURL(/type=premium/)
  await expect(
    main.getByRole("button", { name: "Change over 7 days" })
  ).toBeHidden()

  await main.getByRole("combobox", { name: "Category" }).click()
  await page.getByRole("option", { name: "Watches" }).click()
  await expect(page).toHaveURL(/category=watches/)
  await expect(
    main.getByRole("tabpanel").getByText("Watches", { exact: true })
  ).toBeVisible()
  for (const row of await rows(page).all()) {
    await expect(row).toContainText("Watches")
    await expect(row).toContainText("Retail")
  }
})

test("invalid params fall back to defaults", async ({ page }) => {
  await page.goto("/rankings?type=;drop table&period=2w&category=%3Cscript%3E")
  const main = page.getByRole("main")
  await expect(
    main.getByRole("heading", { level: 2, name: "Top gainers" })
  ).toBeVisible()
  await expect(
    main.getByText("All categories · 30 days", { exact: true })
  ).toBeVisible()
})

test("unknown category shows the empty state", async ({ page }) => {
  await page.goto("/rankings?category=yachts")
  await expect(
    page.getByRole("main").getByText("No products qualify", { exact: true })
  ).toBeVisible()
})

test("a ranked product links to its detail page", async ({ page }) => {
  await page.goto("/rankings?type=premium")
  const link = rows(page).first().getByRole("link")
  const name = await link.innerText()
  await link.click()
  await expect(page).toHaveURL(/\/products\/[a-z0-9-]+$/)
  await expect(page.getByRole("heading", { level: 1, name })).toBeVisible()
})
