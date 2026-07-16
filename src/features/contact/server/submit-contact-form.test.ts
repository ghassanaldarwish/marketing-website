import { beforeEach, describe, expect, it, vi } from "vitest"

import type { ContactAbuseDecision } from "@/features/contact/server/contact-abuse-protection"
import type { ContactFormType } from "@/features/contact/contact-schema"
import { createSubmitContactFormHandler } from "@/features/contact/server/submit-contact-form-handler"
import { TelegramDeliveryError } from "@/lib/telegram-client"

const checkAbuseProtectionMock =
  vi.fn<(honeypot: string) => Promise<ContactAbuseDecision>>()
const sendTelegramMessageMock = vi.fn<(message: string) => Promise<void>>()
const submitContactForm = createSubmitContactFormHandler({
  checkAbuseProtection: checkAbuseProtectionMock,
  sendMessage: sendTelegramMessageMock,
})

const validContactForm: ContactFormType = {
  name: "Ada Lovelace",
  email: "ada@example.test",
  message: "I would like to discuss a backend engineering project.",
  website: "",
}

describe("submitContactForm", () => {
  beforeEach(() => {
    checkAbuseProtectionMock.mockReset().mockResolvedValue("allow")
    sendTelegramMessageMock.mockReset()
  })

  it("returns success only after abuse checks and confirmed delivery", async () => {
    sendTelegramMessageMock.mockResolvedValueOnce()

    await expect(submitContactForm(validContactForm)).resolves.toEqual({
      status: "success",
    })
    expect(checkAbuseProtectionMock).toHaveBeenCalledWith("")
    expect(sendTelegramMessageMock).toHaveBeenCalledTimes(1)
  })

  it("conceals a honeypot rejection without calling Telegram", async () => {
    checkAbuseProtectionMock.mockResolvedValueOnce("honeypot")

    await expect(
      submitContactForm({
        ...validContactForm,
        website: "https://spam.example",
      })
    ).resolves.toEqual({ status: "success" })

    expect(checkAbuseProtectionMock).toHaveBeenCalledWith(
      "https://spam.example"
    )
    expect(sendTelegramMessageMock).not.toHaveBeenCalled()
  })

  it.each(["rate_limited", "store_failure"] as const)(
    "returns the same generic retry state for %s",
    async (decision) => {
      checkAbuseProtectionMock.mockResolvedValueOnce(decision)

      await expect(submitContactForm(validContactForm)).resolves.toEqual({
        status: "rate_limited",
      })
      expect(sendTelegramMessageMock).not.toHaveBeenCalled()
    }
  )

  it("returns structured field errors before running abuse checks", async () => {
    const result = await submitContactForm({
      name: "",
      email: "not-an-email",
      message: "short",
      website: "",
    })

    expect(result).toEqual({
      status: "validation_error",
      fieldErrors: {
        name: ["TOO_SHORT"],
        email: ["INVALID_FORMAT"],
        message: ["TOO_SHORT"],
      },
    })
    expect(checkAbuseProtectionMock).not.toHaveBeenCalled()
    expect(sendTelegramMessageMock).not.toHaveBeenCalled()
  })

  it.each(["TIMEOUT", "NETWORK_ERROR"])(
    "returns a delivery error for %s",
    async (code) => {
      sendTelegramMessageMock.mockRejectedValueOnce(
        new TelegramDeliveryError(code)
      )

      await expect(submitContactForm(validContactForm)).resolves.toEqual({
        status: "delivery_error",
      })
    }
  )

  it("returns a safe unexpected error and logs no PII", async () => {
    const error = new TypeError("Sensitive internal diagnostic")
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined)

    sendTelegramMessageMock.mockRejectedValueOnce(error)

    await expect(submitContactForm(validContactForm)).resolves.toEqual({
      status: "unexpected_error",
    })
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Unexpected contact form submission failure.",
      { errorType: "TypeError" }
    )

    const logged = JSON.stringify(consoleErrorSpy.mock.calls)
    expect(logged).not.toContain(validContactForm.name)
    expect(logged).not.toContain(validContactForm.email)
    expect(logged).not.toContain(validContactForm.message)
    expect(logged).not.toContain(error.message)
  })
})
