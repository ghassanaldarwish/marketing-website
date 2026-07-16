import "server-only"

import { createHmac } from "node:crypto"

import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

import { getContactAbuseEnvironment } from "@/lib/config/server-environment"

type HeaderReader = Pick<Headers, "get">

export type ContactRateLimitResult = {
  success: boolean
  remaining: number
  reset: number
}

export type ContactRateLimiter = {
  limit(identifier: string): Promise<ContactRateLimitResult>
}

export type ContactAbuseDecision =
  "allow" | "honeypot" | "rate_limited" | "store_failure"

type ContactAbuseEnvironment = ReturnType<typeof getContactAbuseEnvironment>

type EvaluateContactAbuseOptions = {
  honeypot: string
  requestHeaders: HeaderReader
  limiter?: ContactRateLimiter
  secret?: string
}

const GLOBAL_RATE_LIMIT_IDENTIFIER = "global-delivery-budget"
const CONTACT_RATE_LIMIT_PREFIX = "contact:rate-limit"

class FixedWindowLimiter implements ContactRateLimiter {
  private readonly buckets = new Map<
    string,
    { attempts: number; reset: number }
  >()

  constructor(
    private readonly maxAttempts: number,
    private readonly windowMilliseconds: number,
    private readonly now: () => number
  ) {}

  async limit(identifier: string): Promise<ContactRateLimitResult> {
    const currentTime = this.now()
    const currentBucket = this.buckets.get(identifier)
    const bucket =
      !currentBucket || currentBucket.reset <= currentTime
        ? {
            attempts: 0,
            reset: currentTime + this.windowMilliseconds,
          }
        : currentBucket

    if (bucket.attempts >= this.maxAttempts) {
      this.buckets.set(identifier, bucket)

      return {
        success: false,
        remaining: 0,
        reset: bucket.reset,
      }
    }

    const updatedBucket = {
      ...bucket,
      attempts: bucket.attempts + 1,
    }
    this.buckets.set(identifier, updatedBucket)

    return {
      success: true,
      remaining: this.maxAttempts - updatedBucket.attempts,
      reset: updatedBucket.reset,
    }
  }
}

function createCombinedRateLimiter(
  requestLimiter: ContactRateLimiter,
  globalLimiter: ContactRateLimiter
): ContactRateLimiter {
  return {
    async limit(identifier) {
      const requestResult = await requestLimiter.limit(identifier)

      if (!requestResult.success) {
        return requestResult
      }

      const globalResult = await globalLimiter.limit(
        GLOBAL_RATE_LIMIT_IDENTIFIER
      )

      if (!globalResult.success) {
        return globalResult
      }

      return {
        success: true,
        remaining: Math.min(requestResult.remaining, globalResult.remaining),
        reset: Math.max(requestResult.reset, globalResult.reset),
      }
    },
  }
}

export function createInMemoryContactRateLimiter(options: {
  maxAttempts: number
  globalMaxAttempts: number
  windowSeconds: number
  now?: () => number
}): ContactRateLimiter {
  const now = options.now ?? Date.now
  const windowMilliseconds = options.windowSeconds * 1_000

  return createCombinedRateLimiter(
    new FixedWindowLimiter(options.maxAttempts, windowMilliseconds, now),
    new FixedWindowLimiter(options.globalMaxAttempts, windowMilliseconds, now)
  )
}

function createRedisContactRateLimiter(
  environment: Extract<ContactAbuseEnvironment, { mode: "redis" }>
): ContactRateLimiter {
  const redis = new Redis({
    url: environment.url,
    token: environment.token,
  })
  const window = `${environment.windowSeconds} s` as `${number} s`
  const requestLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(environment.maxAttempts, window),
    analytics: false,
    prefix: `${CONTACT_RATE_LIMIT_PREFIX}:request`,
  })
  const globalLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(environment.globalMaxAttempts, window),
    analytics: false,
    prefix: `${CONTACT_RATE_LIMIT_PREFIX}:global`,
  })

  return createCombinedRateLimiter(
    {
      async limit(identifier) {
        const result = await requestLimiter.limit(identifier)
        await result.pending
        return result
      },
    },
    {
      async limit(identifier) {
        const result = await globalLimiter.limit(identifier)
        await result.pending
        return result
      },
    }
  )
}

let runtimeLimiter: ContactRateLimiter | undefined

function getRuntimeContactRateLimiter(
  environment: ContactAbuseEnvironment
): ContactRateLimiter {
  runtimeLimiter ??=
    environment.mode === "redis"
      ? createRedisContactRateLimiter(environment)
      : createInMemoryContactRateLimiter(environment)

  return runtimeLimiter
}

function getFirstAddress(value: string | null): string | undefined {
  const address = value?.split(",")[0]?.trim()
  return address || undefined
}

function getRequestAddress(requestHeaders: HeaderReader): string {
  const cloudflareAddress = getFirstAddress(
    requestHeaders.get("cf-connecting-ip")
  )
  const hasCloudflareRay = Boolean(requestHeaders.get("cf-ray"))

  if (cloudflareAddress && hasCloudflareRay) {
    return cloudflareAddress
  }

  return (
    getFirstAddress(requestHeaders.get("x-vercel-forwarded-for")) ??
    getFirstAddress(requestHeaders.get("x-forwarded-for")) ??
    "unknown-client"
  )
}

export function createContactRequestKey(
  requestHeaders: HeaderReader,
  secret: string
): string {
  return createHmac("sha256", secret)
    .update(`v1:${getRequestAddress(requestHeaders)}`)
    .digest("hex")
}

function getSafeErrorClassification(error: unknown): string {
  if (error instanceof Error && error.name) {
    return error.name
  }

  return "UnknownError"
}

export async function evaluateContactAbuseProtection(
  options: EvaluateContactAbuseOptions
): Promise<ContactAbuseDecision> {
  if (options.honeypot.trim()) {
    console.info("Contact abuse protection decision.", {
      event: "contact_abuse_protection",
      status: "honeypot",
    })
    return "honeypot"
  }

  const environment = getContactAbuseEnvironment()
  const limiter = options.limiter ?? getRuntimeContactRateLimiter(environment)
  const secret = options.secret ?? environment.secret
  const requestKey = createContactRequestKey(options.requestHeaders, secret)

  try {
    const result = await limiter.limit(requestKey)

    if (!result.success) {
      console.warn("Contact abuse protection decision.", {
        event: "contact_abuse_protection",
        status: "rate_limited",
        remaining: result.remaining,
        resetAt: result.reset,
      })
      return "rate_limited"
    }

    console.info("Contact abuse protection decision.", {
      event: "contact_abuse_protection",
      status: "allowed",
      remaining: result.remaining,
      resetAt: result.reset,
    })
    return "allow"
  } catch (error) {
    console.error("Contact abuse protection decision.", {
      event: "contact_abuse_protection",
      status: "store_failure",
      errorType: getSafeErrorClassification(error),
    })
    return "store_failure"
  }
}
