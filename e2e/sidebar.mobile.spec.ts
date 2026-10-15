import { expect, test } from "@playwright/test"

test("mobile drawer opens and closes after navigating", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("button", { name: "Toggle Sidebar" }).click()
  const drawer = page.getByRole("dialog")
  await expect(drawer).toBeVisible()
  await drawer.getByRole("link", { name: "Rankings" }).click()
  await expect(
    page.getByRole("heading", { level: 1, name: "Rankings" })
  ).toBeVisible()
  await expect(drawer).toBeHidden()
})
