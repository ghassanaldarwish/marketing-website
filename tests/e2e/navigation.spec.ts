import { expect, test } from "@playwright/test"

test("language switching preserves the logical route", async ({
  page,
  isMobile,
}) => {
  await page.goto("/en/about?source=e2e")

  if (isMobile) {
    await page.getByRole("button", { name: /open.*menu/i }).click()
  }

  await page
    .getByRole("button", { name: /german|deutsch/i })
    .first()
    .click()

  await expect(page).toHaveURL(/\/de\/about\?source=e2e$/)
  await expect(page.locator("html")).toHaveAttribute("lang", "de")
})

test("mobile menu opens, navigates, and closes", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile-project-only scenario")

  await page.goto("/en")
  await page.getByRole("button", { name: /open.*menu/i }).click()

  const closeButton = page.getByRole("button", { name: /close.*menu/i })
  await expect(closeButton).toBeVisible()

  await page
    .getByRole("navigation")
    .last()
    .getByRole("link", { name: /about/i })
    .click()

  await expect(page).toHaveURL(/\/en\/about$/)
  await expect(closeButton).toHaveCount(0)
})
