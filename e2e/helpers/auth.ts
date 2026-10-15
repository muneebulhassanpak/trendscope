import { expect, type Page } from "@playwright/test"

/** Signs in with the seeded admin account (ADMIN_EMAIL / ADMIN_PASSWORD). */
export async function signInAsAdmin(page: Page, next = "/admin/observations") {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set (see .env.example)"
    )
  }
  await page.goto(`/login?next=${encodeURIComponent(next)}`)
  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Password").fill(password)
  await page.getByRole("button", { name: "Sign in", exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`${next.replace(/[/?]/g, "\\$&")}$`))
}

/** Signs in with the read-only demo account. */
export async function signInAsDemo(page: Page, next = "/admin/observations") {
  await page.goto(`/login?next=${encodeURIComponent(next)}`)
  await page.getByRole("button", { name: "Explore as demo admin" }).click()
  await expect(page).toHaveURL(new RegExp(`${next.replace(/[/?]/g, "\\$&")}$`))
}
