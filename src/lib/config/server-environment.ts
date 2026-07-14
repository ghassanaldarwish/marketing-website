import "server-only"

import { parseTelegramEnvironment } from "@/lib/config/environment"

export function getTelegramEnvironment() {
  // parseTelegramEnvironment currently types its parameter as string;
  // cast the env object to bypass the type mismatch while preserving runtime behavior.
  return parseTelegramEnvironment({
    NODE_ENV: process.env.NODE_ENV,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    GROUP_CHAT_ID: process.env.GROUP_CHAT_ID,
    TELEGRAM_REQUEST_TIMEOUT_MS: process.env.TELEGRAM_REQUEST_TIMEOUT_MS,
  } as unknown as string)
}
