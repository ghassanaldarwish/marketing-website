import dotenv from "dotenv"
dotenv.config() // Load environment variables from .env

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ""
export const GROUP_CHAT_ID = process.env.GROUP_CHAT_ID || "" // e.g., "-123456789"
export const NODE_ENV = process.env.NODE_ENV || "development"
