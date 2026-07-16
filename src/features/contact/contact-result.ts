import type { ContactFormType } from "@/features/contact/contact-schema"

export type ContactField = Exclude<keyof ContactFormType, "website">

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
      status: "rate_limited"
    }
  | {
      status: "unexpected_error"
    }
