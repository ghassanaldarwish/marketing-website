import { expect, test } from "@playwright/test"

test("theme choice persists across navigation", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("theme", "light"))
  await page.goto("/en")

  const themeButton = page.getByRole("button", { name: /theme/i }).first()
  await themeButton.click()
  await page.getByRole("menuitem", { name: /dark/i }).click()

  await expect(page.locator("html")).toHaveClass(/dark/)

  await page.getByRole("link", { name: /about/i }).first().click()

  await expect(page).toHaveURL(/\/en\/about$/)
  await expect(page.locator("html")).toHaveClass(/dark/)
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("theme")))
    .toBe("dark")
})
