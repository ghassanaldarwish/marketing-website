import assert from "node:assert/strict"
import test from "node:test"

import { parseTelegramEnvironment, ServerEnvironmentError } from "./environment"

test("development uses a no-op adapter without credentials", () => {
  assert.deepEqual(parseTelegramEnvironment({ NODE_ENV: "development" }), {
    enabled: false,
    nodeEnv: "development",
    requestTimeoutMs: 8_000,
  })
})

test("missing production settings fail with a redacted configuration error", () => {
  assert.throws(
    () => parseTelegramEnvironment({ NODE_ENV: "production" }),
    (error) => {
      assert.ok(error instanceof ServerEnvironmentError)
      assert.match(error.message, /TELEGRAM_BOT_TOKEN/)
      assert.match(error.message, /GROUP_CHAT_ID/)
      return true
    }
  )
})

test("configuration errors do not expose existing secrets", () => {
  const secret = "sensitive-token-value"

  assert.throws(
    () =>
      parseTelegramEnvironment({
        NODE_ENV: "production",
        TELEGRAM_BOT_TOKEN: secret,
      }),
    (error) => {
      assert.ok(error instanceof ServerEnvironmentError)
      assert.doesNotMatch(error.message, new RegExp(secret))
      return true
    }
  )
})

test("production configuration is validated and normalized", () => {
  assert.deepEqual(
    parseTelegramEnvironment({
      NODE_ENV: "production",
      TELEGRAM_BOT_TOKEN: "configured-token",
      GROUP_CHAT_ID: "-123456789",
      TELEGRAM_REQUEST_TIMEOUT_MS: "5000",
    }),
    {
      enabled: true,
      nodeEnv: "production",
      botToken: "configured-token",
      chatId: "-123456789",
      requestTimeoutMs: 5_000,
    }
  )
})
