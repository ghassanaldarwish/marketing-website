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

    const form = page.locator("#contact-form")
    const submit = form.locator('button[type="submit"]')

    await submit.click()
    await expect(page.locator("#contact-name")).toHaveAttribute(
      "aria-invalid",
      "true"
    )
    await expect(
      page.getByText("Name must be at least 2 characters.")
    ).toBeVisible()

    await page.locator("#contact-name").fill("Test User")
    await page.locator("#contact-email").fill("test.user@example.test")
    await page
      .locator("#contact-message")
      .fill("This is a valid automated contact message.")
    await submit.click()

    await expect(page.getByRole("dialog")).toBeHidden()
  })

  test("localizes German fields and client validation messages", async ({
    page,
  }) => {
    await page.goto("/de/contact")

    await expect(page.getByLabel("Vollständiger Name")).toHaveAttribute(
      "placeholder",
      "Max Mustermann"
    )
    await expect(page.getByLabel("E-Mail-Adresse")).toHaveAttribute(
      "placeholder",
      "max.mustermann@example.com"
    )
    await expect(page.getByLabel("Nachricht")).toHaveAttribute(
      "placeholder",
      "Erzählen Sie mir von Ihrem Projekt, Ihrer Idee oder Ihrer Gelegenheit..."
    )

    const form = page.locator("#contact-form")
    await form.locator('button[type="submit"]').click()

    await expect(
      page.getByText("Der Name muss mindestens 2 Zeichen lang sein.")
    ).toBeVisible()
    await expect(
      page.getByText("Bitte geben Sie eine gültige E-Mail-Adresse ein.")
    ).toBeVisible()
    await expect(
      page.getByText("Die Nachricht muss mindestens 10 Zeichen lang sein.")
    ).toBeVisible()
  })
})