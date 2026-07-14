import { expect, test } from "@playwright/test"

test.describe("Contact dialog", () => {
  test("opens with the keyboard, traps focus, closes with Escape, and returns focus", async ({
    page,
  }) => {
    await page.goto("/en")

    const trigger = page.locator('button[aria-haspopup="dialog"]').last()
    await trigger.focus()
    await page.keyboard.press("Enter")

    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()
    await expect(page.locator("#contact-name")).toBeFocused()

    await page.keyboard.press("Shift+Tab")
    await expect(dialog.locator(":focus")).toBeVisible()

    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test("preserves validation and successful submission wiring", async ({
    page,
  }) => {
    await page.goto("/en")

    const trigger = page.locator('button[aria-haspopup="dialog"]').last()
    await trigger.click()

    const submit = page.locator('button[form="contact-form"]')
    await submit.click()
    await expect(page.locator("#contact-name")).toHaveAttribute(
      "aria-invalid",
      "true"
    )

    await page.locator("#contact-name").fill("Test User")
    await page.locator("#contact-email").fill("test.user@example.test")
    await page
      .locator("#contact-message")
      .fill("This is a valid automated contact message.")
    await submit.click()

    await expect(page.getByRole("dialog")).toBeHidden()
  })
})
