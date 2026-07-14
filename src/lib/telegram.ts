import "server-only"

import { getTelegramEnvironment } from "@/lib/config/server-environment"
import { createTelegramSender } from "@/lib/telegram-client.mjs"

export async function sendTelegramMessage(message: string): Promise<void> {
  const environment = getTelegramEnvironment()

  if (!environment.enabled) {
    return
  }

  const sendMessage = createTelegramSender({
    botToken: environment.botToken,
    chatId: environment.chatId,
    requestTimeoutMs: environment.requestTimeoutMs,
  })

  await sendMessage(message)
}
