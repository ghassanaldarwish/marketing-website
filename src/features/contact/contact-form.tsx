"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import {
  type ContactField,
  type ContactFieldErrors,
  type ContactValidationErrorCode,
  type SubmitContactFormResult,
} from "@/features/contact/contact-result"
import {
  createContactFormSchema,
  type ContactFormType,
} from "@/features/contact/contact-schema"
import { submitContactForm } from "@/features/contact/server/submit-contact-form"

type ContactFormProps = {
  onSuccess?: () => void
}

type SubmissionAnnouncement = {
  kind: "success" | "error"
  message: string
}

const contactFields: ContactField[] = ["name", "email", "message"]

export function ContactForm({ onSuccess }: ContactFormProps) {
  const t = useTranslations("contact.form")
  const [announcement, setAnnouncement] =
    useState<SubmissionAnnouncement | null>(null)

  const validationMessages = {
    nameMin: t("validation.nameMin"),
    emailInvalid: t("validation.emailInvalid"),
    messageMin: t("validation.messageMin"),
    messageMax: t("validation.messageMax"),
  }

  const localizedSchema = useMemo(
    () => createContactFormSchema(validationMessages),
    [
      validationMessages.emailInvalid,
      validationMessages.messageMax,
      validationMessages.messageMin,
      validationMessages.nameMin,
    ]
  )

  const form = useForm<ContactFormType>({
    resolver: zodResolver(localizedSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  })

  function getServerFieldErrorMessage(
    field: ContactField,
    codes: ContactValidationErrorCode[]
  ): string {
    switch (field) {
      case "name":
        return validationMessages.nameMin
      case "email":
        return validationMessages.emailInvalid
      case "message":
        return codes.includes("TOO_LONG")
          ? validationMessages.messageMax
          : validationMessages.messageMin
      default: {
        const exhaustiveCheck: never = field
        return exhaustiveCheck
      }
    }
  }

  function applyServerFieldErrors(fieldErrors: ContactFieldErrors): void {
    let firstInvalidField: ContactField | undefined

    for (const field of contactFields) {
      const codes = fieldErrors[field]

      if (!codes?.length) {
        continue
      }

      firstInvalidField ??= field
      form.setError(field, {
        type: "server",
        message: getServerFieldErrorMessage(field, codes),
      })
    }

    if (firstInvalidField) {
      form.setFocus(firstInvalidField)
    }
  }

  function announceError(message: string): void {
    setAnnouncement({ kind: "error", message })
    toast.error(message)
  }

  function handleSubmissionResult(result: SubmitContactFormResult): void {
    switch (result.status) {
      case "success": {
        const message = t("toast.success")

        setAnnouncement({ kind: "success", message })
        toast.success(message)
        form.reset()
        onSuccess?.()
        return
      }

      case "validation_error":
        applyServerFieldErrors(result.fieldErrors)
        announceError(t("toast.validationError"))
        return

      case "delivery_error":
        announceError(t("toast.deliveryError"))
        return

      case "unexpected_error":
        announceError(t("toast.unexpectedError"))
        return

      default: {
        const exhaustiveCheck: never = result
        return exhaustiveCheck
      }
    }
  }

  async function onSubmit(data: ContactFormType) {
    setAnnouncement(null)

    try {
      const result = await submitContactForm(data)
      handleSubmissionResult(result)
    } catch {
      announceError(t("toast.unexpectedError"))
    }
  }

  return (
    <div className="w-full">
      <form
        id="contact-form"
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FieldGroup>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="contact-name">
                  {t("fields.name.label")}
                </FieldLabel>
                <Input
                  {...field}
                  id="contact-name"
                  placeholder={t("fields.name.placeholder")}
                  autoComplete="name"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="contact-email">
                  {t("fields.email.label")}
                </FieldLabel>
                <Input
                  {...field}
                  id="contact-email"
                  type="email"
                  placeholder={t("fields.email.placeholder")}
                  autoComplete="email"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="message"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="contact-message">
                  {t("fields.message.label")}
                </FieldLabel>
                <InputGroup>
                  <InputGroupTextarea
                    {...field}
                    id="contact-message"
                    rows={8}
                    maxLength={5000}
                    className="min-h-40 resize-none"
                    placeholder={t("fields.message.placeholder")}
                    aria-invalid={fieldState.invalid}
                  />
                  <InputGroupAddon align="block-end">
                    <InputGroupText className="tabular-nums">
                      {t("characterCount", {
                        current: field.value.length,
                        maximum: 5000,
                      })}
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        {announcement && (
          <p
            className="sr-only"
            role={announcement.kind === "error" ? "alert" : "status"}
            aria-live="polite"
            aria-atomic="true"
          >
            {announcement.message}
          </p>
        )}
      </form>
    </div>
  )
}
