import { expect, test } from "@playwright/test"

test("admin routes redirect anonymous visitors to sign in", async ({
  page,
}) => {
  await page.goto("/admin/sources")
  await expect(page).toHaveURL(/\/login\?next=%2Fadmin%2Fsources$/)
  await expect(
    page.getByRole("button", { name: "Explore as demo admin" })
  ).toBeVisible()
})

test("invalid credentials show a generic error", async ({ page }) => {
  await page.goto("/login")
  await page.getByLabel("Email").fill("nobody@example.com")
  await page.getByLabel("Password").fill("wrong-password")
  await page.getByRole("button", { name: "Sign in", exact: true }).click()
  await expect(page.getByText("Invalid email or password.")).toBeVisible()
})

test("open redirects via ?next are ignored", async ({ page, baseURL }) => {
  await page.goto("/login?next=//evil.example.com")
  await page.getByRole("button", { name: "Explore as demo admin" }).click()
  await expect(page).toHaveURL(/\/admin\/observations$/)
  expect(new URL(page.url()).host).toBe(new URL(baseURL!).host)
})

test("demo admin can browse the admin area read-only and sign out", async ({
  page,
}) => {
  await page.goto("/admin/sync")
  await page.getByRole("button", { name: "Explore as demo admin" }).click()

  await expect(page).toHaveURL(/\/admin\/sync$/)
  await expect(page.getByText("Read-only demo")).toBeVisible()
  await expect(page.getByText("demo@trendscope.dev")).toBeVisible()

  await page.getByText("demo@trendscope.dev").click()
  await page.getByRole("menuitem", { name: "Sign out" }).click()
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible()

  await page.goto("/admin/sync")
  await expect(page).toHaveURL(/\/login/)
})
