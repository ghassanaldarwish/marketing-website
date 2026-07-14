"use server"

import { sendTelegramMessage } from "@/lib/telegram"
import { contactFormSchema } from "@/lib/validation"

export async function submitContactForm(formData: FormData) {
  const values = Object.fromEntries(formData.entries())
  const parsed = contactFormSchema.safeParse(values)

  if (!parsed.success) {
    return { error: "Validation error" }
  }

  const message = [
    "New message from ghassan.de",
    "",
    `Name: ${parsed.data.name}`,
    `Email: ${parsed.data.email}`,
    "",
    "Message:",
    parsed.data.message,
  ].join("\n")

  try {
    await sendTelegramMessage(message)
    return { success: true }
  } catch {
    console.error("Contact form delivery failed.")
    return { error: "Error" }
  }
}
