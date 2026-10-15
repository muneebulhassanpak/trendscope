import { expect, test, type Page } from "@playwright/test"

const selected = (page: Page) =>
  page.getByRole("list", { name: "Selected products" }).locator("> li")
const addButton = (page: Page) =>
  page.getByRole("button", { name: /Add product/ })

async function pick(page: Page, search: string, option: string) {
  await addButton(page).click()
  await page.getByRole("combobox", { name: "Search products" }).fill(search)
  await page.getByRole("option", { name: new RegExp(option) }).click()
}

test("empty state suggests comparisons", async ({ page }) => {
  await page.goto("/compare")
  const main = page.getByRole("main")
  await expect(
    main.getByText("Nothing to compare yet", { exact: true })
  ).toBeVisible()

  await main.getByRole("link", { name: /Rolex icons/ }).click()
  await expect(page).toHaveURL(
    /products=rolex-submariner-126610ln,rolex-daytona-126500ln,rolex-gmt-master-ii-pepsi/
  )
  await expect(selected(page)).toHaveCount(3)
  await expect(addButton(page)).toBeHidden()
  await expect(
    page.locator("[data-slot=chart] .recharts-line-curve")
  ).toHaveCount(3)
  await expect(main.getByRole("table")).toContainText("1y high")
})

test("picker adds products and remove buttons drop them", async ({ page }) => {
  await page.goto("/compare")

  await pick(page, "kelly", "Hermès Kelly 28 Epsom")
  await expect(page).toHaveURL(/products=hermes-kelly-28-epsom$/)
  await expect(selected(page)).toHaveCount(2) // one product + the picker slot

  await addButton(page).click()
  await page.getByRole("combobox", { name: "Search products" }).fill("kelly")
  await expect(
    page.getByRole("option", { name: /Hermès Kelly 28 Epsom/ })
  ).toHaveAttribute("aria-disabled", "true")
  await page.keyboard.press("Escape")

  await pick(page, "submariner", "Rolex Submariner")
  await expect(page).toHaveURL(
    /products=hermes-kelly-28-epsom,rolex-submariner-126610ln$/
  )
  await pick(page, "panda", "Nike Dunk Low Panda")
  await expect(page).toHaveURL(
    /products=hermes-kelly-28-epsom,rolex-submariner-126610ln,nike-dunk-low-panda$/
  )
  await expect(addButton(page)).toBeHidden()

  await page.getByRole("link", { name: "Remove Hermès Kelly 28 Epsom" }).click()
  await expect(page).toHaveURL(
    /products=rolex-submariner-126610ln,nike-dunk-low-panda$/
  )
  await expect(addButton(page)).toBeVisible()
})

test("unknown, malformed and duplicate slugs are ignored; max three", async ({
  page,
}) => {
  await page.goto(
    "/compare?products=nope,rolex-daytona-126500ln,ROLEX-DAYTONA-126500LN,%3Cscript%3E,hermes-birkin-30-togo,nike-dunk-low-panda,adidas-samba-og-white"
  )
  const headers = page.getByRole("main").getByRole("columnheader")
  await expect(selected(page)).toHaveCount(3)
  await expect(headers).toHaveText([
    "Metric",
    "Rolex Cosmograph Daytona 126500LN",
    "Hermès Birkin 30 Togo",
    "Nike Dunk Low Panda",
  ])
  await expect(
    page.getByRole("main").getByText("Adidas Samba OG Cloud White")
  ).toHaveCount(0)
})

test("chart period toggle and product detail entry point", async ({ page }) => {
  await page.goto("/products/hermes-kelly-28-epsom")
  await page
    .getByRole("main")
    .getByRole("link", { name: "Compare", exact: true })
    .click()
  await expect(page).toHaveURL(/\/compare\?products=hermes-kelly-28-epsom$/)
  await expect(page.locator("[data-slot=chart] .recharts-line")).toBeVisible()

  await page.getByRole("button", { name: "Show 1Y" }).click()
  await expect(page.getByRole("button", { name: "Show 1Y" })).toHaveAttribute(
    "aria-pressed",
    "true"
  )
})
