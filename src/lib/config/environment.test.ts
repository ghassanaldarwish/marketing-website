import { describe, expect, it } from "vitest"

import {
  ContactAbuseEnvironmentError,
  parseContactAbuseEnvironment,
  parseTelegramEnvironment,
  ServerEnvironmentError,
} from "./environment"

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

describe("parseContactAbuseEnvironment", () => {
  it("requires Redis credentials and an HMAC secret in production", () => {
    expect(() =>
      parseContactAbuseEnvironment({
        NODE_ENV: "production",
      })
    ).toThrow(ContactAbuseEnvironmentError)
  })

  it("returns the production Redis configuration and bounded defaults", () => {
    expect(
      parseContactAbuseEnvironment({
        NODE_ENV: "production",
        KV_REST_API_URL: "https://example.upstash.io",
        KV_REST_API_TOKEN: "test-token",
        CONTACT_RATE_LIMIT_SECRET: "test-secret",
      })
    ).toEqual({
      mode: "redis",
      url: "https://example.upstash.io",
      token: "test-token",
      secret: "test-secret",
      maxAttempts: 3,
      globalMaxAttempts: 30,
      windowSeconds: 600,
    })
  })

  it("uses the deterministic in-memory limiter only for explicit CI E2E runs", () => {
    expect(
      parseContactAbuseEnvironment({
        NODE_ENV: "production",
        CI: "true",
        E2E_USE_IN_MEMORY_CONTACT_RATE_LIMIT: "true",
      })
    ).toEqual({
      mode: "memory",
      secret: "non-production-contact-rate-limit-secret",
      maxAttempts: 3,
      globalMaxAttempts: 30,
      windowSeconds: 600,
    })

    expect(() =>
      parseContactAbuseEnvironment({
        NODE_ENV: "production",
        E2E_USE_IN_MEMORY_CONTACT_RATE_LIMIT: "true",
      })
    ).toThrow(ContactAbuseEnvironmentError)
  })

  it("validates custom operational limits", () => {
    expect(() =>
      parseContactAbuseEnvironment({
        NODE_ENV: "development",
        CONTACT_RATE_LIMIT_MAX_ATTEMPTS: "0",
      })
    ).toThrow()
  })
})
