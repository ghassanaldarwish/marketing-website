import { describe, expect, it, vi } from "vitest"

import { createTelegramSender, TelegramDeliveryError } from "./telegram-client"

const configuration = {
  botToken: "test-token",
  chatId: "-123456789",
  requestTimeoutMs: 1_000,
}

function jsonResponse(
  body: {
    ok: boolean
    error_code?: number
  },
  status = 200
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  })
}

describe("createTelegramSender", () => {
  it("resolves only after a successful Telegram response", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({
        ok: true,
      })
    )

    const sender = createTelegramSender(configuration, fetchMock)

    await expect(sender("visitor message")).resolves.toBeUndefined()

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("sends plain text without parse_mode", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({
        ok: true,
      })
    )

    const sender = createTelegramSender(configuration, fetchMock)
    const message = "*bold* _italic_ [link](https://example.com)"

    await sender(message)

    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [, requestInit] = fetchMock.mock.calls[0]

    expect(requestInit?.method).toBe("POST")
    expect(requestInit?.headers).toEqual({
      "Content-Type": "application/json",
    })

    const requestBody = JSON.parse(String(requestInit?.body)) as {
      chat_id: string
      text: string
      parse_mode?: string
    }

    expect(requestBody).toEqual({
      chat_id: configuration.chatId,
      text: message,
    })

    expect(requestBody).not.toHaveProperty("parse_mode")
  })

  it.each([400, 429, 500])(
    "rejects HTTP %s with a typed redacted error",
    async (status) => {
      const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
        jsonResponse(
          {
            ok: false,
          },
          status
        )
      )

      const sender = createTelegramSender(configuration, fetchMock)

      let thrownError: unknown

      try {
        await sender("private visitor content")
      } catch (error) {
        thrownError = error
      }

      expect(thrownError).toBeInstanceOf(TelegramDeliveryError)
      expect(thrownError).toMatchObject({
        code: "HTTP_ERROR",
        status,
      })

      expect(String(thrownError)).not.toContain(configuration.botToken)
      expect(String(thrownError)).not.toContain("private visitor content")
    }
  )

  it("rejects network failures with a typed redacted error", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValue(
        new Error(
          `Network failure at https://api.telegram.org/bot${configuration.botToken}/sendMessage`
        )
      )

    const sender = createTelegramSender(configuration, fetchMock)

    let thrownError: unknown

    try {
      await sender("private visitor content")
    } catch (error) {
      thrownError = error
    }

    expect(thrownError).toBeInstanceOf(TelegramDeliveryError)
    expect(thrownError).toMatchObject({
      code: "NETWORK_ERROR",
    })

    expect(String(thrownError)).not.toContain(configuration.botToken)
    expect(String(thrownError)).not.toContain("private visitor content")
  })

  it("rejects invalid JSON as a malformed response", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response("not-json", {
        status: 200,
      })
    )

    const sender = createTelegramSender(configuration, fetchMock)

    await expect(sender("private visitor content")).rejects.toMatchObject({
      code: "MALFORMED_RESPONSE",
    })
  })

  it("rejects an unexpected JSON response shape", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          result: {},
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    )

    const sender = createTelegramSender(configuration, fetchMock)

    await expect(sender("private visitor content")).rejects.toMatchObject({
      code: "MALFORMED_RESPONSE",
    })
  })

  it("rejects timeout failures", async () => {
    const fetchMock = vi.fn<typeof fetch>(
      (_input, requestInit) =>
        new Promise<Response>((_resolve, reject) => {
          requestInit?.signal?.addEventListener(
            "abort",
            () => {
              reject(new DOMException("Aborted", "AbortError"))
            },
            {
              once: true,
            }
          )
        })
    )

    const sender = createTelegramSender(
      {
        ...configuration,
        requestTimeoutMs: 5,
      },
      fetchMock
    )

    await expect(sender("private visitor content")).rejects.toMatchObject({
      code: "TIMEOUT",
    })
  })

  it("rejects explicit Telegram API failures", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({
        ok: false,
        error_code: 400,
      })
    )

    const sender = createTelegramSender(configuration, fetchMock)

    await expect(sender("private visitor content")).rejects.toMatchObject({
      code: "API_REJECTED",
    })
  })
})
