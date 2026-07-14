import { describe, expect, it } from "vitest"

import { parseTelegramEnvironment, ServerEnvironmentError } from "./environment"

describe("parseTelegramEnvironment", () => {
  it("uses a no-op adapter in development without credentials", () => {
    expect(
      parseTelegramEnvironment({
        NODE_ENV: "development",
      })
    ).toEqual({
      enabled: false,
      nodeEnv: "development",
      requestTimeoutMs: 8_000,
    })
  })

  it("uses a no-op adapter in test mode without credentials", () => {
    expect(
      parseTelegramEnvironment({
        NODE_ENV: "test",
      })
    ).toEqual({
      enabled: false,
      nodeEnv: "test",
      requestTimeoutMs: 8_000,
    })
  })

  it("fails when production settings are missing", () => {
    expect(() =>
      parseTelegramEnvironment({
        NODE_ENV: "production",
      })
    ).toThrow(ServerEnvironmentError)
  })

  it("reports the names of missing production variables", () => {
    expect(() =>
      parseTelegramEnvironment({
        NODE_ENV: "production",
      })
    ).toThrow(
      "Invalid Telegram server configuration. Missing required environment variables: TELEGRAM_BOT_TOKEN, GROUP_CHAT_ID."
    )
  })

  it("does not expose existing secrets in configuration errors", () => {
    const secret = "sensitive-token-value"

    let thrownError: unknown

    try {
      parseTelegramEnvironment({
        NODE_ENV: "production",
        TELEGRAM_BOT_TOKEN: secret,
      })
    } catch (error) {
      thrownError = error
    }

    expect(thrownError).toBeInstanceOf(ServerEnvironmentError)
    expect(String(thrownError)).not.toContain(secret)
    expect(String(thrownError)).toContain("GROUP_CHAT_ID")
  })

  it("validates and normalizes production configuration", () => {
    expect(
      parseTelegramEnvironment({
        NODE_ENV: "production",
        TELEGRAM_BOT_TOKEN: "configured-token",
        GROUP_CHAT_ID: "-123456789",
        TELEGRAM_REQUEST_TIMEOUT_MS: "5000",
      })
    ).toEqual({
      enabled: true,
      nodeEnv: "production",
      botToken: "configured-token",
      chatId: "-123456789",
      requestTimeoutMs: 5_000,
    })
  })

  it("rejects request timeouts below the minimum", () => {
    expect(() =>
      parseTelegramEnvironment({
        NODE_ENV: "production",
        TELEGRAM_BOT_TOKEN: "configured-token",
        GROUP_CHAT_ID: "-123456789",
        TELEGRAM_REQUEST_TIMEOUT_MS: "999",
      })
    ).toThrow()
  })

  it("rejects request timeouts above the maximum", () => {
    expect(() =>
      parseTelegramEnvironment({
        NODE_ENV: "production",
        TELEGRAM_BOT_TOKEN: "configured-token",
        GROUP_CHAT_ID: "-123456789",
        TELEGRAM_REQUEST_TIMEOUT_MS: "30001",
      })
    ).toThrow()
  })
})
