import { expect, test, type Page } from "@playwright/test"

async function useRateLimitIdentity(page: Page, identity: string) {
  await page.setExtraHTTPHeaders({
    "cf-connecting-ip": identity,
    "cf-ray": `e2e-${identity}`,
  })
}

async function fillContactForm(page: Page, suffix: string) {
  await page.locator("#contact-name").fill(`Playwright ${suffix}`)
  await page.locator("#contact-email").fill(`playwright.${suffix}@example.com`)
  await page
    .locator("#contact-message")
    .fill(`Deterministic E2E message ${suffix} that cannot reach Telegram.`)
}

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
}, testInfo) => {
  await useRateLimitIdentity(
    page,
    `normal-${testInfo.project.name}-${testInfo.retry}`
  )
  await page.goto("/en/contact")

  await fillContactForm(page, "normal")
  await page.getByRole("button", { name: /send/i }).click()

  await expect(page.locator("#contact-name")).toHaveValue("")
  await expect(page.locator("#contact-email")).toHaveValue("")
  await expect(page.locator("#contact-message")).toHaveValue("")
})

test("honeypot submission is concealed and never delivered", async ({
  page,
}, testInfo) => {
  await useRateLimitIdentity(
    page,
    `honeypot-${testInfo.project.name}-${testInfo.retry}`
  )
  await page.goto("/en/contact")

  await fillContactForm(page, "honeypot")
  await page.locator("#contact-website").fill("https://spam.example")
  await page.getByRole("button", { name: /send/i }).click()

  await expect(page.locator("#contact-name")).toHaveValue("")
  await expect(page.locator("#contact-email")).toHaveValue("")
  await expect(page.locator("#contact-message")).toHaveValue("")
})

const localizedRateLimitCases = [
  {
    locale: "en",
    submitName: /send/i,
    message:
      "Your message cannot be sent right now. Please try again in a few minutes.",
  },
  {
    locale: "de",
    submitName: /nachricht senden/i,
    message:
      "Ihre Nachricht kann derzeit nicht gesendet werden. Bitte versuchen Sie es in einigen Minuten erneut.",
  },
  {
    locale: "ar",
    submitName: /إرسال الرسالة/i,
    message: "لا يمكن إرسال رسالتك الآن. يرجى المحاولة مرة أخرى بعد بضع دقائق.",
  },
] as const

for (const { locale, submitName, message } of localizedRateLimitCases) {
  test(`limits bursts with a generic ${locale} response`, async ({
    page,
  }, testInfo) => {
    await useRateLimitIdentity(
      page,
      `burst-${locale}-${testInfo.project.name}-${testInfo.retry}`
    )
    await page.goto(`/${locale}/contact`)

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      await fillContactForm(page, `${locale}-${attempt}`)
      await page.getByRole("button", { name: submitName }).click()
      await expect(page.locator("#contact-name")).toHaveValue("")
    }

    await fillContactForm(page, `${locale}-limited`)
    await page.getByRole("button", { name: submitName }).click()

    await expect(page.locator("#contact-form").getByRole("alert")).toHaveText(
      message
    )
  })
}
