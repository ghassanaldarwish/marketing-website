import { z } from "zod"

const telegramSuccessResponseSchema = z.object({
  ok: z.literal(true),
})

const telegramErrorResponseSchema = z.object({
  ok: z.literal(false),
})

function getTelegramDeliveryErrorMessage(code, status) {
  switch (code) {
    case "HTTP_ERROR":
      return status
        ? `Telegram delivery failed with HTTP status ${status}.`
        : "Telegram delivery failed with an HTTP error."
    case "TIMEOUT":
      return "Telegram delivery timed out."
    case "NETWORK_ERROR":
      return "Telegram delivery failed because of a network error."
    case "MALFORMED_RESPONSE":
      return "Telegram returned an invalid response."
    case "API_REJECTED":
      return "Telegram rejected the message."
    default:
      return "Telegram delivery failed."
  }
}

export class TelegramDeliveryError extends Error {
  constructor(code, status) {
    super(getTelegramDeliveryErrorMessage(code, status))
    this.name = "TelegramDeliveryError"
    this.code = code
    this.status = status
  }
}

function createTelegramEndpoint(botToken) {
  return `https://api.telegram.org/bot${botToken}/sendMessage`
}

async function parseTelegramResponse(response) {
  try {
    return await response.json()
  } catch {
    throw new TelegramDeliveryError("MALFORMED_RESPONSE")
  }
}

export function createTelegramSender(configuration, fetchImplementation = fetch) {
  return async function sendTelegramMessage(message) {
    const abortController = new AbortController()
    const timeout = setTimeout(() => {
      abortController.abort()
    }, configuration.requestTimeoutMs)

    let response

    try {
      response = await fetchImplementation(
        createTelegramEndpoint(configuration.botToken),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: configuration.chatId,
            text: message,
          }),
          signal: abortController.signal,
        }
      )
    } catch {
      if (abortController.signal.aborted) {
        throw new TelegramDeliveryError("TIMEOUT")
      }

      throw new TelegramDeliveryError("NETWORK_ERROR")
    } finally {
      clearTimeout(timeout)
    }

    if (!response.ok) {
      throw new TelegramDeliveryError("HTTP_ERROR", response.status)
    }

    const responseBody = await parseTelegramResponse(response)
    const successResult = telegramSuccessResponseSchema.safeParse(responseBody)

    if (successResult.success) {
      return
    }

    const errorResult = telegramErrorResponseSchema.safeParse(responseBody)

    if (errorResult.success) {
      throw new TelegramDeliveryError("API_REJECTED")
    }

    throw new TelegramDeliveryError("MALFORMED_RESPONSE")
  }
}
