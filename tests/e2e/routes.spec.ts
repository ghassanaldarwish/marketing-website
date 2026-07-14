import { expect, test } from "@playwright/test"

const publishedLocales = ["en", "de"] as const

for (const locale of publishedLocales) {
  test(`${locale} critical routes render`, async ({ page }) => {
    for (const path of ["", "/about", "/articles", "/contact"]) {
      const response = await page.goto(`/${locale}${path}`)

      expect(
        response?.status(),
        `/${locale}${path} should render`
      ).toBeLessThan(400)
      await expect(page.locator("html")).toHaveAttribute("lang", locale)
      await expect(page.locator("main")).toBeVisible()
    }
  })

  test(`${locale} article list navigates to an article`, async ({ page }) => {
    await page.goto(`/${locale}/articles`)

    const articleLink = page
      .locator(`main a[href^="/${locale}/articles/"]`)
      .first()

    await expect(articleLink).toBeVisible()
    await articleLink.click()

    await expect(page).toHaveURL(new RegExp(`/${locale}/articles/[^/?#]+`))
    await expect(page.locator("main")).toBeVisible()
  })

  test(`${locale} unknown article returns not found`, async ({ page }) => {
    const response = await page.goto(`/${locale}/articles/does-not-exist`)

    expect(response?.status()).toBe(404)
  })

  test(`${locale} unknown route returns not found`, async ({ page }) => {
    const response = await page.goto(`/${locale}/does-not-exist`)

    expect(response?.status()).toBe(404)
  })
}

test("Arabic is publicly advertised after GH-022", async ({
  page,
  isMobile,
}) => {
  await page.goto("/en")

  if (isMobile) {
    await page.getByRole("button", { name: /open.*menu/i }).click()
  }

  const arabicLanguageButton = page
    .getByRole("button", { name: /arabic/i })
    .first()

  await expect(arabicLanguageButton).toBeVisible()
  await arabicLanguageButton.click()

  await expect(page).toHaveURL(/\/ar(?:[/?#]|$)/)
  await expect(page.locator("html")).toHaveAttribute("lang", "ar")
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl")
  await expect(page.locator("main")).toBeVisible()
})