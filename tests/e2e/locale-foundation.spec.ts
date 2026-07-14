import { expect, test } from "@playwright/test"

const localeExpectations = [
  { locale: "en", direction: "ltr" },
  { locale: "de", direction: "ltr" },
  { locale: "ar", direction: "rtl" },
] as const

const staticPaths = ["", "/about", "/contact", "/articles"] as const

for (const { locale, direction } of localeExpectations) {
  for (const path of staticPaths) {
    test(`${locale}${path || "/"} uses the published locale contract`, async ({
      page,
    }) => {
      const response = await page.goto(`/${locale}${path}`)

      expect(response?.status()).toBeLessThan(400)
      await expect(page.locator("html")).toHaveAttribute("lang", locale)
      await expect(page.locator("html")).toHaveAttribute("dir", direction)
    })
  }
}

test("an unsupported locale returns not found", async ({ page }) => {
  const response = await page.goto("/fr/about")

  expect(response?.status()).toBe(404)
})
