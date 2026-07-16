"use server"

import { headers } from "next/headers"

import { evaluateContactAbuseProtection } from "@/features/contact/server/contact-abuse-protection"
import { createSubmitContactFormHandler } from "@/features/contact/server/submit-contact-form-handler"
import { sendTelegramMessage } from "@/lib/telegram"

export async function submitContactForm(input: unknown) {
  const requestHeaders = await headers()
  const handler = createSubmitContactFormHandler({
    checkAbuseProtection: (honeypot) =>
      evaluateContactAbuseProtection({ honeypot, requestHeaders }),
    sendMessage: sendTelegramMessage,
  })

  return handler(input)
}
