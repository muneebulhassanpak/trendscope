import { createClient } from "@supabase/supabase-js"
import { expect, test } from "@playwright/test"

import { signInAsAdmin, signInAsDemo } from "./helpers/auth"

const DEMO_EMAIL = "demo@trendscope.dev"

/** Looks up a profile id with the secret key (test setup only). */
async function profileId(email: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY
  if (!url || !key) throw new Error("Supabase env is required for this test")
  const db = createClient(url, key, { auth: { persistSession: false } })
  const { data, error } = await db
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single()
  if (error) throw error
  return data.id as string
}

test("theme selector switches between light and dark", async ({ page }) => {
  await signInAsDemo(page, "/settings")
  const html = page.locator("html")

  await page.getByRole("button", { name: "Light" }).click()
  await expect(html).toHaveClass(/\blight\b/)
  await expect(page.getByRole("button", { name: "Light" })).toHaveAttribute(
    "aria-pressed",
    "true"
  )

  await page.getByRole("button", { name: "Dark" }).click()
  await expect(html).toHaveClass(/\bdark\b/)
})

test("admin sees the profile editor and users section", async ({ page }) => {
  await signInAsAdmin(page, "/settings")
  const main = page.getByRole("main")

  await expect(main.getByLabel("Display name")).toBeVisible()
  await expect(main.getByText("Users & roles", { exact: true })).toBeVisible()
  const users = main.getByRole("list", { name: "Users" })
  await expect(users.getByText(DEMO_EMAIL)).toBeVisible()
  // Own role cannot be changed from the UI.
  await expect(
    main.getByRole("combobox", { name: `Role for ${process.env.ADMIN_EMAIL}` })
  ).toBeDisabled()
})

test("admin saves their display name", async ({ page }) => {
  await signInAsAdmin(page, "/settings")
  const name = page.getByRole("main").getByLabel("Display name")
  const current = await name.inputValue()

  await name.fill("")
  await page.getByRole("button", { name: "Save" }).click()
  await expect(page.getByText("Enter a display name.")).toBeVisible()

  await name.fill(current || "Admin")
  await page.getByRole("button", { name: "Save" }).click()
  await expect(page.getByText("Profile saved.")).toBeVisible()
})

test("demo sees a read-only profile and no users section", async ({ page }) => {
  await signInAsDemo(page, "/settings")
  const main = page.getByRole("main")

  await expect(main.getByText(DEMO_EMAIL)).toBeVisible()
  await expect(main.getByText("The demo profile is read-only.")).toBeVisible()
  await expect(main.getByText("Users & roles")).toHaveCount(0)
  await expect(main.getByText(process.env.ADMIN_EMAIL!)).toHaveCount(0)
  await expect(main.getByRole("button", { name: "Sign out" })).toBeVisible()
})

test("server rejects a tampered request to change your own role", async ({
  page,
}) => {
  const adminId = await profileId(process.env.ADMIN_EMAIL!)
  const demoId = await profileId(DEMO_EMAIL)
  await signInAsAdmin(page, "/settings")

  // Rewrite the role-change action so it targets the signed-in admin.
  // If the rewrite cannot be applied, abort rather than change the demo user.
  await page.route("**/settings", async (route) => {
    const request = route.request()
    if (request.method() !== "POST" || !request.headers()["next-action"]) {
      return route.continue()
    }
    const body = request.postDataBuffer()?.toString("utf8") ?? ""
    if (!body.includes(demoId)) return route.abort()
    return route.continue({ postData: body.replaceAll(demoId, adminId) })
  })

  await page.getByRole("combobox", { name: `Role for ${DEMO_EMAIL}` }).click()
  await page.getByRole("option", { name: /Viewer/ }).click()
  const dialog = page.getByRole("alertdialog")
  await expect(dialog).toContainText(DEMO_EMAIL)
  await dialog.getByRole("button", { name: "Change role" }).click()

  await expect(
    page.getByText("You can't change your own role. Ask another admin.")
  ).toBeVisible()
  await expect(
    page.getByRole("combobox", { name: `Role for ${DEMO_EMAIL}` })
  ).toHaveText(/Demo/)
})
