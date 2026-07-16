import {
  type ContactField,
  type ContactFieldErrors,
  type ContactValidationErrorCode,
  type SubmitContactFormResult,
} from "@/features/contact/contact-result"
import { contactFormSchema } from "@/features/contact/contact-schema"
import type { ContactAbuseDecision } from "@/features/contact/server/contact-abuse-protection"
import { TelegramDeliveryError } from "@/lib/telegram-client"

type SubmitContactFormDependencies = {
  checkAbuseProtection(honeypot: string): Promise<ContactAbuseDecision>
  sendMessage(message: string): Promise<void>
}

const contactFields = new Set<ContactField>(["name", "email", "message"])

function isContactField(value: PropertyKey): value is ContactField {
  return typeof value === "string" && contactFields.has(value as ContactField)
}

function getValidationErrorCode(issueCode: string): ContactValidationErrorCode {
  switch (issueCode) {
    case "invalid_type":
      return "REQUIRED"
    case "invalid_string":
    case "invalid_format":
      return "INVALID_FORMAT"
    case "too_small":
      return "TOO_SHORT"
    case "too_big":
      return "TOO_LONG"
    default:
      return "INVALID_VALUE"
  }
}

function createFieldErrors(
  issues: ReadonlyArray<{ code: string; path: PropertyKey[] }>
): ContactFieldErrors {
  const fieldErrors: ContactFieldErrors = {}

  for (const issue of issues) {
    const field = issue.path[0]

    if (!isContactField(field)) {
      continue
    }

    const errorCode = getValidationErrorCode(issue.code)
    const currentErrors = fieldErrors[field] ?? []

    if (!currentErrors.includes(errorCode)) {
      fieldErrors[field] = [...currentErrors, errorCode]
    }
  }

  return fieldErrors
}

function createTelegramMessage(values: {
  name: string
  email: string
  message: string
}): string {
  return [
    "New message from ghassan.de",
    "",
    `Name: ${values.name}`,
    `Email: ${values.email}`,
    "",
    "Message:",
    values.message,
  ].join("\n")
}

function getSafeErrorClassification(error: unknown): string {
  if (error instanceof Error && error.name) {
    return error.name
  }

  return "UnknownError"
}

export function createSubmitContactFormHandler(
  dependencies: SubmitContactFormDependencies
) {
  return async function submitContactFormHandler(
    input: unknown
  ): Promise<SubmitContactFormResult> {
    const parsed = contactFormSchema.safeParse(input)

    if (!parsed.success) {
      return {
        status: "validation_error",
        fieldErrors: createFieldErrors(parsed.error.issues),
      }
    }

    const abuseDecision = await dependencies.checkAbuseProtection(
      parsed.data.website
    )

    if (abuseDecision === "honeypot") {
      return { status: "success" }
    }

    if (abuseDecision === "rate_limited" || abuseDecision === "store_failure") {
      return { status: "rate_limited" }
    }

    try {
      await dependencies.sendMessage(createTelegramMessage(parsed.data))

      return { status: "success" }
    } catch (error) {
      if (error instanceof TelegramDeliveryError) {
        return { status: "delivery_error" }
      }

      console.error("Unexpected contact form submission failure.", {
        errorType: getSafeErrorClassification(error),
      })

      return { status: "unexpected_error" }
    }
  }
}
