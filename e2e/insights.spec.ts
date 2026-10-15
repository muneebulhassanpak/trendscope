import { expect, test } from "@playwright/test"

const publishedTitles = [
  "The Retro Runner Takeover",
  "Earth Tones Are the New Neutral",
  "Steel Sports Watches Cool Off",
]

test("lists published reports, newest first, without drafts", async ({
  page,
}) => {
  await page.goto("/insights")
  const main = page.getByRole("main")

  await expect(
    main.getByRole("heading", { level: 1, name: "Insights" })
  ).toBeVisible()
  const titles = main.getByRole("heading", { level: 2 }).filter({
    has: page.locator("a[href^='/insights/']"),
  })
  await expect(titles).toHaveText(publishedTitles)
  await expect(
    main.getByText("Q4 Luxury Bag Outlook", { exact: true })
  ).toHaveCount(0)
  await expect(
    main.locator("a[href='/insights/q4-luxury-bag-outlook']")
  ).toHaveCount(0)
})

test("product chips on a card link to the product", async ({ page }) => {
  await page.goto("/insights")
  await page
    .getByRole("main")
    .getByRole("link", { name: "Hermès Kelly 28 Epsom", exact: true })
    .click()
  await expect(page).toHaveURL(/\/products\/hermes-kelly-28-epsom$/)
})

test("detail renders Markdown and links its products", async ({ page }) => {
  await page.goto("/insights")
  await page
    .getByRole("main")
    .getByRole("link", { name: "The Retro Runner Takeover", exact: true })
    .click()

  await expect(page).toHaveURL(/\/insights\/the-retro-runner-takeover$/)
  await expect(page).toHaveTitle("The Retro Runner Takeover · TrendScope")
  const main = page.getByRole("main")
  await expect(
    main.getByRole("heading", { level: 1, name: "The Retro Runner Takeover" })
  ).toBeVisible()

  // Markdown: `##` headings, a bulleted list with bold lead-ins, emphasis.
  await expect(
    main.getByRole("heading", { level: 2, name: "What we are seeing" })
  ).toBeVisible()
  await expect(
    main.getByRole("heading", { level: 2, name: "What to watch" })
  ).toBeVisible()
  const list = main
    .getByRole("list")
    .filter({ hasText: "Sell-outs on restock." })
  await expect(list.getByRole("listitem")).toHaveCount(3)
  await expect(
    list.locator("strong", { hasText: "Silver and cream lead." })
  ).toBeVisible()
  await expect(main.locator("em", { hasText: "material" })).toBeVisible()

  const products = main.getByRole("complementary", {
    name: "Products in this report",
  })
  await expect(products.getByRole("link")).toHaveCount(4)
  await products
    .getByRole("link", { name: /Asics Gel-1130 Pure Silver/ })
    .click()
  await expect(page).toHaveURL(/\/products\/asics-gel-1130-silver$/)
})

test("back link returns to the list", async ({ page }) => {
  await page.goto("/insights/steel-sports-watches-cool-off")
  // Scoped by href: the header breadcrumb also exposes "Insights" as a link.
  await page.getByRole("main").locator("a[href='/insights']").click()
  await expect(page).toHaveURL(/\/insights$/)
})

for (const slug of ["q4-luxury-bag-outlook", "does-not-exist"]) {
  test(`${slug} shows not found`, async ({ page }) => {
    await page.goto(`/insights/${slug}`)
    await expect(
      page.getByRole("main").getByText("Report not found", { exact: true })
    ).toBeVisible()
    await expect(page.getByText("Q4 Luxury Bag Outlook")).toHaveCount(0)
  })
}
