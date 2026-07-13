import axios from "axios"
import { NODE_ENV, GROUP_CHAT_ID, TELEGRAM_BOT_TOKEN } from "./config/config"

export async function sendTelegramMessage(message: string) {
  try {
    if (NODE_ENV === "development") {
      console.log("Telegram message (development):", message)
      return
    }

    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: GROUP_CHAT_ID,
        text: message,
        parse_mode: "Markdown",
      }
    )
  } catch (error) {
    console.error("Failed to send Telegram message:", error)
  }
}
