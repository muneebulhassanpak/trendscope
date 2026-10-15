import { expect, test } from "@playwright/test"

const marketPages = [
  { link: "Products", heading: "Products" },
  { link: "Compare", heading: "Compare" },
  { link: "Rankings", heading: "Rankings" },
  { link: "Trends", heading: "Trends" },
  { link: "Insights", heading: "Insights" },
]

test("dashboard renders inside the app shell", async ({ page }) => {
  await page.goto("/")
  await expect(page).toHaveTitle("TrendScope")
  await expect(
    page.getByRole("heading", { level: 1, name: "Dashboard" })
  ).toBeVisible()
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible()
})

for (const { link, heading } of marketPages) {
  test(`sidebar navigates to ${link}`, async ({ page }) => {
    await page.goto("/")
    await page.getByRole("link", { name: link, exact: true }).click()
    await expect(
      page.getByRole("heading", { level: 1, name: heading })
    ).toBeVisible()
    await expect(page).toHaveTitle(`${heading} · TrendScope`)
  })
}
