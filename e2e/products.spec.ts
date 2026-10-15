import { expect, test } from "@playwright/test"

const table = (page: import("@playwright/test").Page) => page.locator("table")

test("lists the catalog with prices and momentum", async ({ page }) => {
  await page.goto("/products")
  await expect(
    page.getByRole("main").getByText("21 products", { exact: true })
  ).toBeVisible()
  await expect(
    table(page).getByRole("link", { name: "Hermès Birkin 30 Togo" })
  ).toBeVisible()
})

test("full-text search narrows results and is reflected in the URL", async ({
  page,
}) => {
  await page.goto("/products")
  await page.getByRole("searchbox", { name: "Search products" }).fill("suede")
  await expect(page).toHaveURL(/q=suede/)
  await expect(
    page.getByRole("main").getByText(/^\d+ products?$/)
  ).not.toHaveText("21 products")
  for (const row of await table(page).locator("tbody tr").all()) {
    await expect(row).toContainText("Suede")
  }
})

test("category filter and clear", async ({ page }) => {
  await page.goto("/products")
  await page.getByRole("combobox", { name: "All categories" }).click()
  await page.getByRole("option", { name: "Watches" }).click()
  await expect(page).toHaveURL(/category=watches/)
  await expect(
    page.getByRole("main").getByText("5 products", { exact: true })
  ).toBeVisible()

  await page.getByRole("button", { name: "Clear" }).click()
  await expect(
    page.getByRole("main").getByText("21 products", { exact: true })
  ).toBeVisible()
})

test("sorting by price ascending puts the cheapest first", async ({ page }) => {
  await page.goto("/products?sort=price&dir=asc")
  const firstPrice = await table(page)
    .locator("tbody tr")
    .first()
    .locator("td")
    .nth(2)
    .innerText()
  const lastPrice = await table(page)
    .locator("tbody tr")
    .last()
    .locator("td")
    .nth(2)
    .innerText()
  const toNumber = (value: string) => Number(value.replace(/[^0-9.]/g, ""))
  expect(toNumber(firstPrice)).toBeLessThan(toNumber(lastPrice))
})

test("empty state for no matches", async ({ page }) => {
  await page.goto("/products?q=zzzznotaproduct")
  await expect(
    page.getByRole("main").getByText("No matching products", { exact: true })
  ).toBeVisible()
})

test("invalid sort params fall back to defaults", async ({ page }) => {
  await page.goto("/products?sort=;drop table&dir=sideways")
  await expect(
    page.getByRole("main").getByText("21 products", { exact: true })
  ).toBeVisible()
})

test("product detail shows chart, stats, observations and insights", async ({
  page,
}) => {
  await page.goto("/products")
  await table(page).getByRole("link", { name: "Hermès Kelly 28 Epsom" }).click()

  await expect(page).toHaveURL(/\/products\/hermes-kelly-28-epsom$/)
  await expect(
    page.getByRole("heading", { level: 1, name: "Hermès Kelly 28 Epsom" })
  ).toBeVisible()
  await expect(page.locator("[data-slot=chart] .recharts-area")).toBeVisible()

  await page.getByRole("button", { name: "Show 1Y" }).click()
  await expect(page.getByRole("button", { name: "Show 1Y" })).toHaveAttribute(
    "aria-pressed",
    "true"
  )

  await expect(page.getByText("Market observations")).toBeVisible()
  await page
    .getByRole("link", { name: "Earth Tones Are the New Neutral" })
    .click()
  await expect(page).toHaveURL(/\/insights\/earth-tones-are-the-new-neutral$/)
})

test("unknown product shows not found", async ({ page }) => {
  await page.goto("/products/does-not-exist")
  await expect(
    page.getByRole("main").getByText("Product not found", { exact: true })
  ).toBeVisible()
})
