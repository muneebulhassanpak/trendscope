import { expect, test, type Page } from "@playwright/test"

const main = (page: Page) => page.getByRole("main")
const card = (page: Page, title: string) =>
  main(page)
    .locator("[data-slot=card]")
    .filter({ has: page.getByText(title, { exact: true }) })

test("shows KPIs for the tracked market", async ({ page }) => {
  await page.goto("/")
  await expect(
    main(page).getByText("Tracked products", { exact: true })
  ).toBeVisible()
  await expect(
    main(page).getByText("Across 3 categories", { exact: true })
  ).toBeVisible()
  await expect(
    main(page).getByText("Market index · 30d", { exact: true })
  ).toBeVisible()
  await expect(
    main(page).getByText("Top gainer · 30d", { exact: true })
  ).toBeVisible()
  await expect(
    main(page).getByText("New observations · 7d", { exact: true })
  ).toBeVisible()
})

test("market index chart plots one line per category and switches period", async ({
  page,
}) => {
  await page.goto("/")
  const chart = page.locator("[data-slot=chart]")
  await expect(chart.locator(".recharts-line")).toHaveCount(3)
  for (const category of ["Sneakers", "Bags", "Watches"]) {
    await expect(
      main(page).getByRole("listitem").filter({ hasText: category }).first()
    ).toBeVisible()
  }

  await page.getByRole("button", { name: "Show 1Y" }).click()
  await expect(page.getByRole("button", { name: "Show 1Y" })).toHaveAttribute(
    "aria-pressed",
    "true"
  )
})

test("top movers link to product pages", async ({ page }) => {
  await page.goto("/")
  await expect(
    main(page).getByText("Top gainers", { exact: true })
  ).toBeVisible()
  await expect(
    main(page).getByText("Top losers", { exact: true })
  ).toBeVisible()

  const movers = card(page, "Top losers").locator("ol a")
  await expect(movers).toHaveCount(5)
  const href = await movers.first().getAttribute("href")
  expect(href).toMatch(/^\/products\/[a-z0-9-]+$/)
  await movers.first().click()
  await expect(page).toHaveURL(new RegExp(`${href}$`))
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
})

test("view all movers opens the sorted product list", async ({ page }) => {
  await page.goto("/")
  await main(page).getByRole("button", { name: "View all top losers" }).click()
  await expect(page).toHaveURL(/\/products\?sort=change_30d_pct&dir=asc$/)
})

test("trending now shows rising and cooling attributes", async ({ page }) => {
  await page.goto("/")
  await expect(
    main(page).getByText("Trending now", { exact: true })
  ).toBeVisible()
  await expect(
    main(page).getByText("Heating up", { exact: true })
  ).toBeVisible()
  await expect(
    main(page).getByText("Cooling off", { exact: true })
  ).toBeVisible()

  await main(page).getByRole("button", { name: "View all trends" }).click()
  await expect(page).toHaveURL(/\/trends$/)
})

test("latest research links to insights and observed products", async ({
  page,
}) => {
  await page.goto("/")
  await expect(
    main(page).getByText("Field notes", { exact: true })
  ).toBeVisible()

  await main(page)
    .getByRole("link", { name: /The Retro Runner Takeover/ })
    .click()
  await expect(page).toHaveURL(/\/insights\/the-retro-runner-takeover$/)

  await page.goto("/")
  const observed = card(page, "Field notes").getByRole("link")
  await expect(observed).toHaveCount(4)
  const href = await observed.first().getAttribute("href")
  expect(href).toMatch(/^\/products\/[a-z0-9-]+$/)
  await observed.first().click()
  await expect(page).toHaveURL(new RegExp(`${href}$`))
})
