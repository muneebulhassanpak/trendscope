import { expect, test, type Page } from "@playwright/test"

const main = (page: Page) => page.getByRole("main")
const dimensionNav = (page: Page) =>
  main(page).getByRole("navigation", { name: "Trend dimension" })

/** First entry of the Rising list, or Cooling if nothing is rising. */
async function firstMover(page: Page) {
  const links = main(page)
    .getByRole("list", { name: /^(Rising|Cooling)$/ })
    .getByRole("link")
  await expect(links.first()).toBeVisible()
  return links.first()
}

test("defaults to colors with movers, chart and heatmap", async ({ page }) => {
  await page.goto("/trends")

  await expect(
    page.getByRole("heading", { level: 1, name: "Trends" })
  ).toBeVisible()
  await expect(
    dimensionNav(page).getByRole("link", { name: "Colors", exact: true })
  ).toHaveAttribute("aria-current", "page")
  await expect(
    main(page).getByText("Score over time", { exact: true })
  ).toBeVisible()
  await expect(
    page.locator("[data-slot=chart] .recharts-line").first()
  ).toBeVisible()
  await expect(
    main(page).getByRole("img", { name: /^Heatmap of weekly trend scores/ })
  ).toBeVisible()
})

test("switching dimension updates the URL and the data", async ({ page }) => {
  await page.goto("/trends")

  await dimensionNav(page).getByRole("link", { name: "Materials" }).click()
  await expect(page).toHaveURL(/\/trends\?dimension=material$/)
  await expect(
    dimensionNav(page).getByRole("link", { name: "Materials" })
  ).toHaveAttribute("aria-current", "page")
  await expect(main(page).getByRole("button", { name: /^Suede/ })).toBeVisible()

  await dimensionNav(page).getByRole("link", { name: "Categories" }).click()
  await expect(page).toHaveURL(/\/trends\?dimension=category$/)
  await expect(main(page).getByRole("button", { name: /^Bags/ })).toBeVisible()
})

test("invalid dimension falls back to colors", async ({ page }) => {
  await page.goto("/trends?dimension=;drop table")
  await expect(
    dimensionNav(page).getByRole("link", { name: "Colors", exact: true })
  ).toHaveAttribute("aria-current", "page")
})

test("movers link to the filtered products list", async ({ page }) => {
  await page.goto("/trends?dimension=material")
  const mover = await firstMover(page)
  const href = await mover.getAttribute("href")
  expect(href).toMatch(/^\/products\?material=[A-Za-z]+$/)

  await mover.click()
  await expect(page).toHaveURL(new RegExp(`${href!.replace("?", "\\?")}$`))
  await expect(
    page.getByRole("heading", { level: 1, name: "Products" })
  ).toBeVisible()
})

test("category movers filter products by slug", async ({ page }) => {
  await page.goto("/trends?dimension=category")
  const mover = await firstMover(page)
  await expect(mover).toHaveAttribute("href", /^\/products\?category=[a-z-]+$/)
})

test("chart lines can be hidden and shown", async ({ page }) => {
  await page.goto("/trends?dimension=category")
  const lines = page.locator("[data-slot=chart] .recharts-line")
  await expect(lines).toHaveCount(3)

  const toggle = main(page).getByRole("button", { name: /^Watches/ })
  await toggle.click()
  await expect(toggle).toHaveAttribute("aria-pressed", "false")
  await expect(lines).toHaveCount(2)

  await toggle.click()
  await expect(lines).toHaveCount(3)
})

test("colors cap the chart at eight lines", async ({ page }) => {
  await page.goto("/trends")
  await expect(page.locator("[data-slot=chart] .recharts-line")).toHaveCount(8)
  await expect(
    main(page).getByRole("group", { name: "Lines shown" }).getByRole("button")
  ).toHaveCount(9)
})

test("heatmap shows a tooltip and has a table view", async ({ page }) => {
  await page.goto("/trends?dimension=category")

  const heatmap = main(page).getByRole("img", {
    name: /^Heatmap of weekly trend scores/,
  })
  await heatmap.focus()
  await page.keyboard.press("ArrowDown")
  await expect(main(page).getByRole("status")).toContainText("Score")

  await main(page).getByRole("button", { name: "View as table" }).click()
  const table = main(page).getByRole("table")
  await expect(table).toBeVisible()
  await expect(
    table.getByRole("columnheader", { name: "Bags", exact: true })
  ).toBeVisible()
  await expect(table.locator("tbody tr")).toHaveCount(26)
})
