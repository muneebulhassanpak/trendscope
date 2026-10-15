import { expect, test } from "@playwright/test"

import { signInAsAdmin } from "./helpers/auth"

test("admin signs in without the read-only banner", async ({ page }) => {
  await signInAsAdmin(page, "/admin/sync")
  await expect(page.getByText("Read-only demo")).toBeHidden()
  await expect(page.getByText(process.env.ADMIN_EMAIL!)).toBeVisible()
})
