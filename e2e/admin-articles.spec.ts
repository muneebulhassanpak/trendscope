import { expect as baseExpect, test, type Page } from "@playwright/test"

import { signInAsAdmin, signInAsDemo } from "./helpers/auth"

// Every step here is a server round trip (save, revalidate, navigate).
const expect = baseExpect.configure({ timeout: 15_000 })

const EDIT_URL = /\/admin\/articles\/[0-9a-f-]{36}\/edit$/

/** Unique per run so tests never touch seeded articles or each other. */
function uniqueTitle(label: string) {
  return `E2E ${label} ${Date.now().toString(36)}`
}

function toast(page: Page, text: string) {
  return page.locator("[data-sonner-toast]", { hasText: text })
}

async function deleteFromList(page: Page, title: string) {
  await page.goto(`/admin/articles?q=${encodeURIComponent(title)}`)
  await page.getByRole("button", { name: `Actions for ${title}` }).click()
  await page.getByRole("menuitem", { name: "Delete" }).click()
  await page.getByRole("button", { name: "Delete article" }).click()
  await expect(toast(page, "Article deleted.")).toBeVisible()
  await expect(page.getByText("No matching articles")).toBeVisible()
}

/** Title of an article a test created and has not deleted yet. */
let leftover: string | null = null

// If a test fails midway, remove what it created so reruns start clean.
test.afterEach(async ({ page }) => {
  if (!leftover) return
  const title = leftover
  leftover = null
  page.on("dialog", (dialog) => void dialog.accept())
  await deleteFromList(page, title)
})

test("draft → publish → unpublish → delete", async ({ page }) => {
  // Many full page loads; a cold dev server needs more than the default.
  test.slow()
  const title = uniqueTitle("lifecycle")
  const slug = title.toLowerCase().replaceAll(" ", "-")

  await signInAsAdmin(page, "/admin/articles")
  await page.getByRole("link", { name: "New article" }).click()
  await expect(page).toHaveURL(/\/admin\/articles\/new$/)

  await page.getByLabel("Title").fill(title)
  await expect(page.getByLabel("Slug")).toHaveValue(slug)
  await page.getByLabel("Excerpt").fill("A temporary report created by e2e.")
  await page
    .getByLabel("Body")
    .fill("## Signals\n\n- **Bold lead.** Supporting detail.\n- Second point")

  await page.getByRole("button", { name: "Linked products" }).click()
  await page.getByPlaceholder("Search products…").fill("Kelly 28")
  await page.getByRole("option", { name: /Hermès Kelly 28 Epsom/ }).click()
  await page.keyboard.press("Escape")
  await expect(
    page.getByRole("list", { name: "Linked products" }).getByRole("listitem")
  ).toHaveText(["Hermès Kelly 28 Epsom"])

  // Live preview renders the Markdown before saving.
  await expect(page.getByRole("heading", { name: "Signals" })).toBeVisible()

  await page.getByRole("button", { name: "Save draft" }).click()
  await expect(toast(page, "Draft created.")).toBeVisible()
  await expect(page).toHaveURL(EDIT_URL)
  leftover = title
  const editUrl = page.url()

  // Drafts never reach the public pages.
  await page.goto("/insights")
  await expect(page.getByRole("main").getByText(title)).toHaveCount(0)
  await page.goto(`/insights/${slug}`)
  await expect(
    page.getByText("Report not found", { exact: true })
  ).toBeVisible()

  await page.goto(editUrl)
  await page.getByRole("button", { name: "Publish" }).click()
  await expect(toast(page, "Article published.")).toBeVisible()
  await expect(page.getByText("Published", { exact: true })).toBeVisible()

  await page.goto("/insights")
  await page.getByRole("main").getByRole("link", { name: title }).click()
  await expect(page).toHaveURL(new RegExp(`/insights/${slug}$`))
  const main = page.getByRole("main")
  await expect(
    main.getByRole("heading", { level: 1, name: title })
  ).toBeVisible()
  await expect(
    main.getByRole("heading", { level: 2, name: "Signals" })
  ).toBeVisible()
  await expect(main.locator("strong", { hasText: "Bold lead." })).toBeVisible()
  await expect(
    main
      .getByRole("complementary", { name: "Products in this report" })
      .getByRole("link", { name: /Hermès Kelly 28 Epsom/ })
  ).toBeVisible()

  await page.goto(editUrl)
  await page.getByRole("button", { name: "Unpublish" }).click()
  await expect(toast(page, "Article moved to drafts.")).toBeVisible()

  await page.goto("/insights")
  await expect(page.getByRole("main").getByText(title)).toHaveCount(0)
  await page.goto(`/insights/${slug}`)
  await expect(
    page.getByText("Report not found", { exact: true })
  ).toBeVisible()

  await deleteFromList(page, title)
  leftover = null
})

test("a taken slug shows a field error and saves nothing", async ({ page }) => {
  const title = uniqueTitle("slug clash")

  await signInAsAdmin(page, "/admin/articles/new")
  await page.getByLabel("Title").fill(title)
  await page.getByLabel("Slug").fill("the-retro-runner-takeover")
  await page.getByRole("button", { name: "Save draft" }).click()

  await expect(
    page.getByText("Another article already uses this slug.")
  ).toBeVisible()
  await expect(page.getByLabel("Slug")).toHaveAttribute("aria-invalid", "true")
  await expect(page).toHaveURL(/\/admin\/articles\/new$/)

  await page.goto(`/admin/articles?q=${encodeURIComponent(title)}`)
  await expect(page.getByText("No matching articles")).toBeVisible()
})

test("demo can preview but not save", async ({ page }) => {
  await signInAsDemo(page, "/admin/articles")
  await page
    .getByRole("main")
    .getByRole("link", { name: "Q4 Luxury Bag Outlook" })
    .click()
  await expect(page).toHaveURL(EDIT_URL)

  await page.getByLabel("Title").fill("Demo was here")
  await expect(page.getByText("Unsaved changes")).toBeVisible()
  // The live preview follows the edit.
  await expect(page.getByText("Demo was here", { exact: true })).toBeVisible()

  await page.getByRole("button", { name: "Save draft" }).click()
  await expect(
    toast(
      page,
      "Demo mode is read-only — changes are disabled for this account."
    )
  ).toBeVisible()

  // Leaving with unsaved edits asks first; accept and confirm nothing changed.
  page.once("dialog", (dialog) => {
    expect(dialog.type()).toBe("beforeunload")
    void dialog.accept()
  })
  await page.reload()
  await expect(page.getByLabel("Title")).toHaveValue("Q4 Luxury Bag Outlook")
  await page.goto("/admin/articles")
  await expect(
    page.getByRole("main").getByRole("link", { name: "Q4 Luxury Bag Outlook" })
  ).toBeVisible()
  await expect(page.getByText("Demo was here")).toHaveCount(0)
})
