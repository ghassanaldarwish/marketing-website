import type { ContactFormType } from "@/features/contact/contact-schema"

export type ContactField = keyof ContactFormType

export type ContactValidationErrorCode =
  "REQUIRED" | "INVALID_FORMAT" | "TOO_SHORT" | "TOO_LONG" | "INVALID_VALUE"

export type ContactFieldErrors = Partial<
  Record<ContactField, ContactValidationErrorCode[]>
>

export type SubmitContactFormResult =
  | {
      status: "success"
    }
  | {
      status: "validation_error"
      fieldErrors: ContactFieldErrors
    }
  | {
      status: "delivery_error"
    }
  | {
      status: "unexpected_error"
    }
