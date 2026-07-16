import { expect, test } from "@playwright/test"

for (const colorScheme of ["light", "dark"] as const) {
  test(`system theme follows the ${colorScheme} preference`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme })
    await page.addInitScript(() => localStorage.setItem("theme", "system"))
    await page.goto("/en")

    await expect(page.locator("html")).toHaveClass(
      colorScheme === "dark" ? /dark/ : /light/
    )

    const colors = await page.locator("body").evaluate((body) => {
      const style = getComputedStyle(body)

      return {
        background: style.backgroundColor,
        foreground: style.color,
      }
    })

    expect(colors.background).not.toBe(colors.foreground)
  })
}

test("theme choice persists across navigation", async ({ page, isMobile }) => {
  await page.addInitScript(() => localStorage.setItem("theme", "light"))
  await page.goto("/en")

  if (isMobile) {
    await page.getByRole("button", { name: /open.*menu/i }).click()
  }

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
