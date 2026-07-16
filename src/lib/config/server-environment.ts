import "server-only"

import {
  parseContactAbuseEnvironment,
  parseTelegramEnvironment,
} from "@/lib/config/environment"

export function getTelegramEnvironment() {
  return parseTelegramEnvironment({
    NODE_ENV: process.env.NODE_ENV,
    CI: process.env.CI,
    E2E_DISABLE_TELEGRAM_DELIVERY: process.env.E2E_DISABLE_TELEGRAM_DELIVERY,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    GROUP_CHAT_ID: process.env.GROUP_CHAT_ID,
    TELEGRAM_REQUEST_TIMEOUT_MS: process.env.TELEGRAM_REQUEST_TIMEOUT_MS,
  })
}

export function getContactAbuseEnvironment() {
  return parseContactAbuseEnvironment({
    NODE_ENV: process.env.NODE_ENV,
    CI: process.env.CI,
    E2E_USE_IN_MEMORY_CONTACT_RATE_LIMIT:
      process.env.E2E_USE_IN_MEMORY_CONTACT_RATE_LIMIT,
    KV_REST_API_URL: process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
    CONTACT_RATE_LIMIT_SECRET: process.env.CONTACT_RATE_LIMIT_SECRET,
    CONTACT_RATE_LIMIT_MAX_ATTEMPTS:
      process.env.CONTACT_RATE_LIMIT_MAX_ATTEMPTS,
    CONTACT_RATE_LIMIT_GLOBAL_MAX_ATTEMPTS:
      process.env.CONTACT_RATE_LIMIT_GLOBAL_MAX_ATTEMPTS,
    CONTACT_RATE_LIMIT_WINDOW_SECONDS:
      process.env.CONTACT_RATE_LIMIT_WINDOW_SECONDS,
  })
}
