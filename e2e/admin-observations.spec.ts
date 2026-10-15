import { expect, test, type Page } from "@playwright/test"

import { signInAsAdmin, signInAsDemo } from "./helpers/auth"
import { deleteTestRows, uniqueMarker } from "./helpers/test-data"

const DEMO_MESSAGE = "Demo mode is read-only"
const PRODUCT = "Nike Dunk Low Panda"
const PRODUCT_PATH = "/products/nike-dunk-low-panda"
const SOURCE = "Secondary market mid-year report"

const marker = uniqueMarker()
test.afterAll(() => deleteTestRows(marker))

const dialog = (page: Page) => page.getByRole("dialog")
const table = (page: Page) => page.getByRole("main").getByRole("table")

async function pickProduct(page: Page, search: string, name: string) {
  await dialog(page).getByLabel("Product").click()
  await page.getByRole("combobox", { name: "Search products" }).fill(search)
  await page.getByRole("option", { name: new RegExp(name) }).click()
}

async function searchNotes(page: Page, text: string) {
  await page.getByRole("searchbox", { name: "Search observations" }).fill(text)
  await expect(page).toHaveURL(new RegExp(`q=${encodeURIComponent(text)}`))
}

test("admin creates, edits and deletes an observation", async ({ page }) => {
  test.slow() // full create → edit → delete round trip across pages
  const note = `Restock rumours pushed asks up overnight (${marker}).`
  const edited = `Restock confirmed; asks cooled by the weekend (${marker}).`
  await signInAsAdmin(page)

  // Empty submit shows field errors and keeps the dialog open.
  await page.getByRole("button", { name: "New observation" }).click()
  await dialog(page).getByRole("button", { name: "Add observation" }).click()
  await expect(dialog(page).getByText("Choose a product.")).toBeVisible()
  await expect(
    dialog(page).getByText("Write at least 10 characters.")
  ).toBeVisible()

  // Create, with normalized tags and a linked source.
  await pickProduct(page, "panda", PRODUCT)
  await dialog(page).getByLabel("Note").fill(note)
  const tags = dialog(page).getByLabel("Tags")
  await tags.fill("Grey Market,")
  await tags.fill("restock")
  await tags.press("Enter")
  await expect(dialog(page).getByText("grey-market")).toBeVisible()
  await dialog(page).getByLabel("Sources").click()
  await page.getByRole("option", { name: new RegExp(SOURCE) }).click()
  await page.keyboard.press("Escape")
  await expect(
    dialog(page).getByRole("list", { name: "Linked sources" })
  ).toContainText(SOURCE)
  await dialog(page).getByRole("button", { name: "Add observation" }).click()
  await expect(page.getByText("Observation added")).toBeVisible()
  await expect(dialog(page)).toBeHidden()

  await searchNotes(page, marker)
  const row = table(page).getByRole("row", { name: new RegExp(marker) })
  await expect(row).toContainText(note)
  await expect(row).toContainText(PRODUCT)
  await expect(row).toContainText("grey-market")
  await expect(row).toContainText("restock")
  await expect(row).toContainText("1 source")

  // It is published on the product page with its source.
  await page.goto(PRODUCT_PATH)
  const published = page.getByRole("listitem").filter({ hasText: note })
  await expect(published).toBeVisible()
  await expect(published.getByRole("link", { name: SOURCE })).toHaveAttribute(
    "rel",
    "noopener noreferrer nofollow"
  )

  // Edit: new note, unlink the source.
  await page.goto(`/admin/observations?q=${marker}`)
  await row
    .getByRole("button", { name: `Edit observation on ${PRODUCT}` })
    .click()
  await expect(dialog(page).getByLabel("Note")).toHaveValue(note)
  await dialog(page).getByLabel("Note").fill(edited)
  await dialog(page)
    .getByRole("button", { name: `Unlink ${SOURCE}` })
    .click()
  await dialog(page).getByRole("button", { name: "Save changes" }).click()
  await expect(page.getByText("Observation updated")).toBeVisible()
  const editedRow = table(page).getByRole("row", { name: new RegExp(marker) })
  await expect(editedRow).toContainText(edited)
  await expect(editedRow).toContainText("0 sources")

  await page.goto(PRODUCT_PATH)
  await expect(page.getByText(edited)).toBeVisible()
  await expect(page.getByText(note)).toHaveCount(0)

  // Delete
  await page.goto(`/admin/observations?q=${marker}`)
  await editedRow
    .getByRole("button", { name: `Delete observation on ${PRODUCT}` })
    .click()
  await page.getByRole("button", { name: "Delete observation" }).click()
  await expect(page.getByText("Observation deleted")).toBeVisible()
  await expect(page.getByText("No matching observations")).toBeVisible()
})

test("filters live in the URL and invalid values fall back", async ({
  page,
}) => {
  await signInAsAdmin(page)

  await page.getByRole("combobox", { name: "Filter by tag" }).click()
  await page.getByRole("option", { name: "auction", exact: true }).click()
  await expect(page).toHaveURL(/tag=auction/)
  await expect(table(page)).toContainText("Hermès Birkin 30 Togo")

  await page.goto(
    "/admin/observations?tag=NOT%20A%20TAG&product=%3Cscript%3E&page=x"
  )
  await expect(
    page.getByRole("combobox", { name: "Filter by tag" })
  ).toContainText("All tags")
  await expect(
    page.getByRole("combobox", { name: "Filter by product" })
  ).toContainText("All products")
  await expect(table(page).getByRole("row").nth(1)).toBeVisible()
})

test("demo account can open the form but cannot save", async ({ page }) => {
  const note = `Demo note that must never be saved (${marker}).`
  await signInAsDemo(page)
  await expect(page.getByText("Read-only demo")).toBeVisible()

  await page.getByRole("button", { name: "New observation" }).click()
  await pickProduct(page, "panda", PRODUCT)
  await dialog(page).getByLabel("Note").fill(note)
  await dialog(page).getByRole("button", { name: "Add observation" }).click()
  await expect(page.getByText(DEMO_MESSAGE)).toBeVisible()
  await expect(dialog(page)).toBeVisible()
  await page.keyboard.press("Escape")

  await searchNotes(page, marker)
  await expect(page.getByText("No matching observations")).toBeVisible()

  // Deleting a seeded observation is refused too.
  await page.getByRole("button", { name: "Clear" }).click()
  const firstRow = table(page).getByRole("row").nth(1)
  await firstRow.getByRole("button", { name: /^Delete observation/ }).click()
  await page.getByRole("button", { name: "Delete observation" }).click()
  await expect(page.getByText(DEMO_MESSAGE)).toBeVisible()
  await expect(page.getByRole("alertdialog")).toBeVisible()
})
