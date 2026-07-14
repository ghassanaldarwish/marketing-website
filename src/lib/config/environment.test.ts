import { describe, expect, it } from "vitest"

import { parseTelegramEnvironment, ServerEnvironmentError } from "./environment"

describe("parseTelegramEnvironment", () => {
  it("requires Telegram credentials in production by default", () => {
    expect(() =>
      parseTelegramEnvironment({
        NODE_ENV: "production",
      })
    ).toThrow(ServerEnvironmentError)
  })

  it("disables Telegram delivery for explicit E2E CI runs", () => {
    expect(
      parseTelegramEnvironment({
        NODE_ENV: "production",
        CI: "true",
        E2E_DISABLE_TELEGRAM_DELIVERY: "true",
      })
    ).toEqual({
      enabled: false,
      nodeEnv: "production",
      requestTimeoutMs: 8_000,
    })
  })

  it("does not allow the E2E switch outside CI", () => {
    expect(() =>
      parseTelegramEnvironment({
        NODE_ENV: "production",
        E2E_DISABLE_TELEGRAM_DELIVERY: "true",
      })
    ).toThrow(ServerEnvironmentError)
  })
})
