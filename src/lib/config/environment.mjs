import { z } from "zod"

const nodeEnvironmentSchema = z.enum(["development", "test", "production"])

const optionalTrimmedStringSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value
  }

  const trimmedValue = value.trim()
  return trimmedValue.length === 0 ? undefined : trimmedValue
}, z.string().min(1).optional())

const rawServerEnvironmentSchema = z.object({
  NODE_ENV: nodeEnvironmentSchema.default("development"),
  TELEGRAM_BOT_TOKEN: optionalTrimmedStringSchema,
  GROUP_CHAT_ID: optionalTrimmedStringSchema,
  TELEGRAM_REQUEST_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .min(1_000)
    .max(30_000)
    .default(8_000),
})

export class ServerEnvironmentError extends Error {
  code = "INVALID_SERVER_ENVIRONMENT"

  constructor(missingVariables) {
    super(
      `Invalid Telegram server configuration. Missing required environment variables: ${missingVariables.join(
        ", "
      )}.`
    )
    this.name = "ServerEnvironmentError"
  }
}

export function parseTelegramEnvironment(environment) {
  const parsedEnvironment = rawServerEnvironmentSchema.parse(environment)
  const missingVariables = []

  if (!parsedEnvironment.TELEGRAM_BOT_TOKEN) {
    missingVariables.push("TELEGRAM_BOT_TOKEN")
  }

  if (!parsedEnvironment.GROUP_CHAT_ID) {
    missingVariables.push("GROUP_CHAT_ID")
  }

  if (missingVariables.length > 0) {
    if (parsedEnvironment.NODE_ENV === "production") {
      throw new ServerEnvironmentError(missingVariables)
    }

    return {
      enabled: false,
      nodeEnv: parsedEnvironment.NODE_ENV,
      requestTimeoutMs: parsedEnvironment.TELEGRAM_REQUEST_TIMEOUT_MS,
    }
  }

  return {
    enabled: true,
    nodeEnv: parsedEnvironment.NODE_ENV,
    botToken: parsedEnvironment.TELEGRAM_BOT_TOKEN,
    chatId: parsedEnvironment.GROUP_CHAT_ID,
    requestTimeoutMs: parsedEnvironment.TELEGRAM_REQUEST_TIMEOUT_MS,
  }
}
