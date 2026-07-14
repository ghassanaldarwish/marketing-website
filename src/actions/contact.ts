"use server"

import { contactFormSchema } from "@/features/contact/contact-schema"
import { sendTelegramMessage } from "@/lib/telegram"

export type ContactFormErrorCode = "VALIDATION_ERROR" | "DELIVERY_ERROR"

export type SubmitContactFormResult =
  | {
      success: true
    }
  | {
      success: false
      errorCode: ContactFormErrorCode
    }

export async function submitContactForm(
  formData: FormData
): Promise<SubmitContactFormResult> {
  const values = Object.fromEntries(formData.entries())
  const parsed = contactFormSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      errorCode: "VALIDATION_ERROR",
    }
  }

  try {
    const message = [
      "New message from ghassan.de",
      "",
      `Name: ${parsed.data.name}`,
      `Email: ${parsed.data.email}`,
      "",
      "Message:",
      parsed.data.message,
    ].join("\n")

    await sendTelegramMessage(message)

    return {
      success: true,
    }
  } catch {
    console.error("Contact form delivery failed.")

    return {
      success: false,
      errorCode: "DELIVERY_ERROR",
    }
  }
}
