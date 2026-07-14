export type TelegramDeliveryErrorCode =
  | "HTTP_ERROR"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "MALFORMED_RESPONSE"
  | "API_REJECTED"

export class TelegramDeliveryError extends Error {
  readonly code: TelegramDeliveryErrorCode
  readonly status?: number
  constructor(code: TelegramDeliveryErrorCode, status?: number)
}

export type TelegramClientConfiguration = {
  botToken: string
  chatId: string
  requestTimeoutMs: number
}

export function createTelegramSender(
  configuration: TelegramClientConfiguration,
  fetchImplementation?: typeof fetch
): (message: string) => Promise<void>
