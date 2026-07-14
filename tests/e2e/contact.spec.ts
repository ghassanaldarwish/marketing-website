import { expect, test } from "@playwright/test"

test("contact form exposes client validation", async ({ page }) => {
  await page.goto("/en/contact")

  await page.getByRole("button", { name: /send/i }).click()

  await expect(page.locator("#contact-name")).toHaveAttribute(
    "aria-invalid",
    "true"
  )
  await expect(page.locator("#contact-email")).toHaveAttribute(
    "aria-invalid",
    "true"
  )
  await expect(page.locator("#contact-message")).toHaveAttribute(
    "aria-invalid",
    "true"
  )
})

test("valid contact submission succeeds with Telegram disabled", async ({
  page,
}) => {
  await page.goto("/en/contact")

  await page.locator("#contact-name").fill("Playwright Test")
  await page.locator("#contact-email").fill("playwright@example.com")
  await page
    .locator("#contact-message")
    .fill("Deterministic E2E message that must not reach Telegram.")
  await page.getByRole("button", { name: /send/i }).click()

  await expect(page.locator("#contact-name")).toHaveValue("")
  await expect(page.locator("#contact-email")).toHaveValue("")
  await expect(page.locator("#contact-message")).toHaveValue("")
})
