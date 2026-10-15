import { expect, test, type Page } from "@playwright/test"

import { signInAsAdmin, signInAsDemo } from "./helpers/auth"
import { deleteTestRows, uniqueMarker } from "./helpers/test-data"

const DEMO_MESSAGE = "Demo mode is read-only"

const marker = uniqueMarker()
test.afterAll(() => deleteTestRows(marker))

// Scoped by title so popovers (also role="dialog") never match.
const dialog = (page: Page) =>
  page.getByRole("dialog", { name: /^(New|Edit) source$/ })
const table = (page: Page) => page.getByRole("main").getByRole("table")

async function search(page: Page, text: string) {
  await page.getByRole("searchbox", { name: "Search sources" }).fill(text)
  await expect(page).toHaveURL(new RegExp(`q=${encodeURIComponent(text)}`))
}

test("admin creates, edits and deletes a source", async ({ page }) => {
  test.slow() // full create → edit → delete round trip across pages
  const title = `Resale outlook ${marker}`
  const renamed = `Resale outlook revised ${marker}`
  await signInAsAdmin(page, "/admin/sources")

  // Validation errors are shown inline and nothing is saved.
  await page.getByRole("button", { name: "New source" }).click()
  await dialog(page).getByLabel("Title").fill("ab")
  await dialog(page).getByLabel("URL").fill("javascript:alert(1)")
  await dialog(page).getByRole("button", { name: "Add source" }).click()
  await expect(
    dialog(page).getByText("Use at least 3 characters.")
  ).toBeVisible()
  await expect(
    dialog(page).getByText(
      "Enter a full link starting with http:// or https://."
    )
  ).toBeVisible()

  // Create
  await dialog(page).getByLabel("Title").fill(title)
  await dialog(page).getByLabel("URL").fill("https://www.example.org/outlook")
  await dialog(page).getByRole("combobox", { name: "Type" }).click()
  await page.getByRole("option", { name: "Report" }).click()
  await dialog(page).getByRole("button", { name: "Add source" }).click()
  await expect(page.getByText("Source added")).toBeVisible()
  await expect(dialog(page)).toBeHidden()

  await search(page, marker)
  const row = table(page).getByRole("row", { name: new RegExp(title) })
  await expect(row).toContainText("Report")
  await expect(row).toContainText("example.org")
  await expect(row).toContainText("0 observations")
  const link = row.getByRole("link", { name: new RegExp(title) })
  await expect(link).toHaveAttribute("href", "https://www.example.org/outlook")
  await expect(link).toHaveAttribute("target", "_blank")
  await expect(link).toHaveAttribute("rel", "noopener noreferrer nofollow")

  // Edit
  await row.getByRole("button", { name: `Edit ${title}` }).click()
  await expect(dialog(page).getByLabel("Title")).toHaveValue(title)
  await dialog(page).getByLabel("Title").fill(renamed)
  await dialog(page).getByRole("button", { name: "Save changes" }).click()
  await expect(page.getByText("Source updated")).toBeVisible()
  const renamedRow = table(page).getByRole("row", { name: new RegExp(renamed) })
  await expect(renamedRow).toBeVisible()

  // Delete
  await renamedRow.getByRole("button", { name: `Delete ${renamed}` }).click()
  await expect(page.getByRole("alertdialog")).toContainText(
    "will be removed permanently"
  )
  await page.getByRole("button", { name: "Delete source" }).click()
  await expect(page.getByText("Source deleted")).toBeVisible()
  await expect(page.getByText("No matching sources")).toBeVisible()
})

test("demo account can open the form but cannot save", async ({ page }) => {
  const title = `Demo source ${marker}`
  await signInAsDemo(page, "/admin/sources")

  await page.getByRole("button", { name: "New source" }).click()
  await dialog(page).getByLabel("Title").fill(title)
  await dialog(page).getByLabel("URL").fill("https://example.com/demo")
  await dialog(page).getByRole("button", { name: "Add source" }).click()
  await expect(page.getByText(DEMO_MESSAGE)).toBeVisible()
  await expect(dialog(page)).toBeVisible()
  await page.keyboard.press("Escape")

  await search(page, marker)
  await expect(page.getByText("No matching sources")).toBeVisible()

  // Deleting a seeded source is refused too.
  await page.getByRole("button", { name: "Clear" }).click()
  const firstRow = table(page).getByRole("row").nth(1)
  await firstRow.getByRole("button", { name: /^Delete / }).click()
  await page.getByRole("button", { name: "Delete source" }).click()
  await expect(page.getByText(DEMO_MESSAGE)).toBeVisible()
  await expect(page.getByRole("alertdialog")).toBeVisible()
})

test("invalid filters fall back to defaults", async ({ page }) => {
  await signInAsAdmin(page, "/admin/sources")
  await page.goto("/admin/sources?type=<script>&page=-4")
  await expect(
    page.getByRole("heading", { level: 1, name: "Sources" })
  ).toBeVisible()
  await expect(
    page.getByRole("combobox", { name: "Filter by type" })
  ).toContainText("All types")
  await expect(table(page).getByRole("row").nth(1)).toBeVisible()
})
