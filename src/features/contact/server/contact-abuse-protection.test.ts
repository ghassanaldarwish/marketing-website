import { describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

import {
  createContactRequestKey,
  createInMemoryContactRateLimiter,
  evaluateContactAbuseProtection,
  type ContactRateLimiter,
} from "@/features/contact/server/contact-abuse-protection"

describe("contact abuse protection", () => {
  it("creates a stable HMAC key without exposing the client address", () => {
    const requestHeaders = new Headers({
      "cf-connecting-ip": "203.0.113.42",
      "cf-ray": "test-ray",
      "x-vercel-forwarded-for": "198.51.100.4",
    })

    const firstKey = createContactRequestKey(requestHeaders, "test-secret")
    const secondKey = createContactRequestKey(requestHeaders, "test-secret")

    expect(firstKey).toBe(secondKey)
    expect(firstKey).toMatch(/^[a-f0-9]{64}$/)
    expect(firstKey).not.toContain("203.0.113.42")
    expect(createContactRequestKey(requestHeaders, "rotated-secret")).not.toBe(
      firstKey
    )
  })

  it("uses Vercel's trusted address when Cloudflare headers are incomplete", () => {
    const withIncompleteCloudflareHeaders = new Headers({
      "cf-connecting-ip": "203.0.113.42",
      "x-vercel-forwarded-for": "198.51.100.4, 198.51.100.5",
    })
    const withVercelAddressOnly = new Headers({
      "x-vercel-forwarded-for": "198.51.100.4",
    })

    expect(
      createContactRequestKey(withIncompleteCloudflareHeaders, "test-secret")
    ).toBe(createContactRequestKey(withVercelAddressOnly, "test-secret"))
  })

  it("limits bursts and resets after the configured window", async () => {
    let currentTime = 10_000
    const limiter = createInMemoryContactRateLimiter({
      maxAttempts: 3,
      globalMaxAttempts: 30,
      windowSeconds: 600,
      now: () => currentTime,
    })

    await expect(limiter.limit("request-key")).resolves.toMatchObject({
      success: true,
      remaining: 2,
    })
    await expect(limiter.limit("request-key")).resolves.toMatchObject({
      success: true,
      remaining: 1,
    })
    await expect(limiter.limit("request-key")).resolves.toMatchObject({
      success: true,
      remaining: 0,
    })
    await expect(limiter.limit("request-key")).resolves.toMatchObject({
      success: false,
      remaining: 0,
    })

    currentTime += 600_000

    await expect(limiter.limit("request-key")).resolves.toMatchObject({
      success: true,
      remaining: 2,
    })
  })

  it("enforces a global delivery budget across different request keys", async () => {
    const limiter = createInMemoryContactRateLimiter({
      maxAttempts: 3,
      globalMaxAttempts: 2,
      windowSeconds: 600,
    })

    await expect(limiter.limit("request-a")).resolves.toMatchObject({
      success: true,
    })
    await expect(limiter.limit("request-b")).resolves.toMatchObject({
      success: true,
    })
    await expect(limiter.limit("request-c")).resolves.toMatchObject({
      success: false,
      remaining: 0,
    })
  })

  it("rejects honeypot submissions before contacting the store", async () => {
    const limiter: ContactRateLimiter = {
      limit: vi.fn().mockRejectedValue(new Error("store should not be used")),
    }
    const consoleInfoSpy = vi
      .spyOn(console, "info")
      .mockImplementation(() => undefined)

    await expect(
      evaluateContactAbuseProtection({
        honeypot: "https://spam.example",
        requestHeaders: new Headers(),
        limiter,
        secret: "test-secret",
      })
    ).resolves.toBe("honeypot")

    expect(limiter.limit).not.toHaveBeenCalled()
    expect(JSON.stringify(consoleInfoSpy.mock.calls)).not.toContain(
      "https://spam.example"
    )
  })

  it("fails closed when the store is unavailable and logs no PII", async () => {
    const requestAddress = "203.0.113.99"
    const error = new TypeError("Sensitive store diagnostic")
    const limiter: ContactRateLimiter = {
      limit: vi.fn().mockRejectedValue(error),
    }
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined)

    await expect(
      evaluateContactAbuseProtection({
        honeypot: "",
        requestHeaders: new Headers({
          "cf-connecting-ip": requestAddress,
          "cf-ray": "test-ray",
        }),
        limiter,
        secret: "test-secret",
      })
    ).resolves.toBe("store_failure")

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Contact abuse protection decision.",
      {
        event: "contact_abuse_protection",
        status: "store_failure",
        errorType: "TypeError",
      }
    )
    const logged = JSON.stringify(consoleErrorSpy.mock.calls)
    expect(logged).not.toContain(requestAddress)
    expect(logged).not.toContain(error.message)
  })
})
