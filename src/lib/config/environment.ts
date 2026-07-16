import { z } from "zod"

const nodeEnvironmentSchema = z.enum(["development", "test", "production"])

const optionalTrimmedStringSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value
  }

  const trimmedValue = value.trim()
  return trimmedValue.length === 0 ? undefined : trimmedValue
}, z.string().min(1).optional())

const booleanEnvironmentSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value
  }

  const normalizedValue = value.trim().toLowerCase()

  if (normalizedValue === "true") {
    return true
  }

  if (normalizedValue === "false" || normalizedValue.length === 0) {
    return false
  }

  return value
}, z.boolean().default(false))

const rawServerEnvironmentSchema = z.object({
  NODE_ENV: nodeEnvironmentSchema.default("development"),
  CI: optionalTrimmedStringSchema,
  E2E_DISABLE_TELEGRAM_DELIVERY: booleanEnvironmentSchema,
  TELEGRAM_BOT_TOKEN: optionalTrimmedStringSchema,
  GROUP_CHAT_ID: optionalTrimmedStringSchema,
  TELEGRAM_REQUEST_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .min(1_000)
    .max(30_000)
    .default(8_000),
})

const rawContactAbuseEnvironmentSchema = z.object({
  NODE_ENV: nodeEnvironmentSchema.default("development"),
  CI: optionalTrimmedStringSchema,
  E2E_USE_IN_MEMORY_CONTACT_RATE_LIMIT: booleanEnvironmentSchema,
  KV_REST_API_URL: optionalTrimmedStringSchema,
  KV_REST_API_TOKEN: optionalTrimmedStringSchema,
  CONTACT_RATE_LIMIT_SECRET: optionalTrimmedStringSchema,
  CONTACT_RATE_LIMIT_MAX_ATTEMPTS: z.coerce
    .number()
    .int()
    .min(1)
    .max(20)
    .default(3),
  CONTACT_RATE_LIMIT_GLOBAL_MAX_ATTEMPTS: z.coerce
    .number()
    .int()
    .min(1)
    .max(1_000)
    .default(30),
  CONTACT_RATE_LIMIT_WINDOW_SECONDS: z.coerce
    .number()
    .int()
    .min(60)
    .max(86_400)
    .default(600),
})

export class ServerEnvironmentError extends Error {
  code = "INVALID_SERVER_ENVIRONMENT"

  constructor(missingVariables: string[]) {
    super(
      `Invalid Telegram server configuration. Missing required environment variables: ${missingVariables.join(
        ", "
      )}.`
    )
    this.name = "ServerEnvironmentError"
  }
}

export class ContactAbuseEnvironmentError extends Error {
  code = "INVALID_CONTACT_ABUSE_ENVIRONMENT"

  constructor(missingVariables: string[]) {
    super(
      `Invalid contact abuse-protection configuration. Missing required environment variables: ${missingVariables.join(
        ", "
      )}.`
    )
    this.name = "ContactAbuseEnvironmentError"
  }
}

export function parseTelegramEnvironment(environment: unknown) {
  const parsedEnvironment = rawServerEnvironmentSchema.parse(environment)
  const deliveryDisabledForE2E =
    parsedEnvironment.CI === "true" &&
    parsedEnvironment.E2E_DISABLE_TELEGRAM_DELIVERY

  if (deliveryDisabledForE2E) {
    return {
      enabled: false,
      nodeEnv: parsedEnvironment.NODE_ENV,
      requestTimeoutMs: parsedEnvironment.TELEGRAM_REQUEST_TIMEOUT_MS,
    }
  }

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

export function parseContactAbuseEnvironment(environment: unknown) {
  const parsedEnvironment = rawContactAbuseEnvironmentSchema.parse(environment)
  const useInMemoryLimiterForE2E =
    parsedEnvironment.CI === "true" &&
    parsedEnvironment.E2E_USE_IN_MEMORY_CONTACT_RATE_LIMIT

  const limits = {
    maxAttempts: parsedEnvironment.CONTACT_RATE_LIMIT_MAX_ATTEMPTS,
    globalMaxAttempts: parsedEnvironment.CONTACT_RATE_LIMIT_GLOBAL_MAX_ATTEMPTS,
    windowSeconds: parsedEnvironment.CONTACT_RATE_LIMIT_WINDOW_SECONDS,
  }

  if (useInMemoryLimiterForE2E || parsedEnvironment.NODE_ENV !== "production") {
    return {
      mode: "memory" as const,
      secret: "non-production-contact-rate-limit-secret",
      ...limits,
    }
  }

  const missingVariables = []

  if (!parsedEnvironment.KV_REST_API_URL) {
    missingVariables.push("KV_REST_API_URL")
  }

  if (!parsedEnvironment.KV_REST_API_TOKEN) {
    missingVariables.push("KV_REST_API_TOKEN")
  }

  if (!parsedEnvironment.CONTACT_RATE_LIMIT_SECRET) {
    missingVariables.push("CONTACT_RATE_LIMIT_SECRET")
  }

  if (missingVariables.length > 0) {
    throw new ContactAbuseEnvironmentError(missingVariables)
  }

  return {
    mode: "redis" as const,
    url: parsedEnvironment.KV_REST_API_URL!,
    token: parsedEnvironment.KV_REST_API_TOKEN!,
    secret: parsedEnvironment.CONTACT_RATE_LIMIT_SECRET!,
    ...limits,
  }
}
