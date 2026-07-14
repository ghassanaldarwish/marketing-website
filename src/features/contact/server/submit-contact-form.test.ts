import { beforeEach, describe, expect, it, vi } from "vitest"

import type { ContactFormType } from "@/features/contact/contact-schema"
import { TelegramDeliveryError } from "@/lib/telegram-client"

const { sendTelegramMessageMock } = vi.hoisted(() => ({
  sendTelegramMessageMock: vi.fn<(message: string) => Promise<void>>(),
}))

vi.mock("@/lib/telegram", () => ({
  sendTelegramMessage: sendTelegramMessageMock,
}))

import { submitContactForm } from "@/features/contact/server/submit-contact-form"

const validContactForm: ContactFormType = {
  name: "Ada Lovelace",
  email: "ada@example.test",
  message: "I would like to discuss a backend engineering project.",
}

describe("submitContactForm", () => {
  beforeEach(() => {
    sendTelegramMessageMock.mockReset()
  })

  it("returns success only after confirmed delivery", async () => {
    sendTelegramMessageMock.mockResolvedValueOnce()

    await expect(submitContactForm(validContactForm)).resolves.toEqual({
      status: "success",
    })
    expect(sendTelegramMessageMock).toHaveBeenCalledTimes(1)
  })

  it("returns structured field errors without calling the adapter", async () => {
    const result = await submitContactForm({
      name: "",
      email: "not-an-email",
      message: "short",
    })

    expect(result).toEqual({
      status: "validation_error",
      fieldErrors: {
        name: ["TOO_SHORT"],
        email: ["INVALID_FORMAT"],
        message: ["TOO_SHORT"],
      },
    })
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
