import "server-only"

import { parseTelegramEnvironment } from "@/lib/config/environment"

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
