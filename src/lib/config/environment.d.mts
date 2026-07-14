export type RawServerEnvironment = {
  NODE_ENV?: "development" | "test" | "production"
  TELEGRAM_BOT_TOKEN?: string
  GROUP_CHAT_ID?: string
  TELEGRAM_REQUEST_TIMEOUT_MS?: string | number
}

export type TelegramEnvironment =
  | {
      enabled: false
      nodeEnv: "development" | "test"
      requestTimeoutMs: number
    }
  | {
      enabled: true
      nodeEnv: "development" | "test" | "production"
      botToken: string
      chatId: string
      requestTimeoutMs: number
    }

export class ServerEnvironmentError extends Error {
  readonly code: "INVALID_SERVER_ENVIRONMENT"
  constructor(missingVariables: readonly string[])
}

export function parseTelegramEnvironment(
  environment: RawServerEnvironment
): TelegramEnvironment
