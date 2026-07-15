"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
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
import { cn } from "@/lib/utils"

type ContactFormProps = {
  submitLabel: string
  cancelLabel?: string
  onCancel?: () => void
  onSuccess?: () => void
  actionsClassName?: string
}

type SubmissionAnnouncement = {
  kind: "status" | "success" | "error"
  message: string
}

const contactFields: ContactField[] = ["name", "email", "message"]

export function ContactForm({
  submitLabel,
  cancelLabel,
  onCancel,
  onSuccess,
  actionsClassName,
}: ContactFormProps) {
  const t = useTranslations("contact.form")
  const [announcement, setAnnouncement] =
    useState<SubmissionAnnouncement | null>(null)

  const nameMinMessage = t("validation.nameMin")
  const emailInvalidMessage = t("validation.emailInvalid")
  const messageMinMessage = t("validation.messageMin")
  const messageMaxMessage = t("validation.messageMax")

  const localizedSchema = useMemo(
    () =>
      createContactFormSchema({
        nameMin: nameMinMessage,
        emailInvalid: emailInvalidMessage,
        messageMin: messageMinMessage,
        messageMax: messageMaxMessage,
      }),
    [emailInvalidMessage, messageMaxMessage, messageMinMessage, nameMinMessage]
  )

  const form = useForm<ContactFormType>({
    resolver: zodResolver(localizedSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  })

  const isSubmitting = form.formState.isSubmitting
  const loadingLabel = `${submitLabel}…`

  function getServerFieldErrorMessage(
    field: ContactField,
    codes: ContactValidationErrorCode[]
  ): string {
    switch (field) {
      case "name":
        return nameMinMessage
      case "email":
        return emailInvalidMessage
      case "message":
        return codes.includes("TOO_LONG")
          ? messageMaxMessage
          : messageMinMessage
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
    setAnnouncement({ kind: "status", message: loadingLabel })

    try {
      const result = await submitContactForm(data)
      handleSubmissionResult(result)
    } catch {
      announceError(t("toast.unexpectedError"))
    }
  }

  return (
    <div className="w-full min-w-0">
      <form
        id="contact-form"
        noValidate
        aria-busy={isSubmitting}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <fieldset disabled={isSubmitting} className="min-w-0 border-0 p-0">
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => {
                const errorId = "contact-name-error"

                return (
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
                      aria-describedby={
                        fieldState.invalid ? errorId : undefined
                      }
                    />
                    {fieldState.invalid && (
                      <FieldError id={errorId} errors={[fieldState.error]} />
                    )}
                  </Field>
                )
              }}
            />

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => {
                const errorId = "contact-email-error"

                return (
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
                      aria-describedby={
                        fieldState.invalid ? errorId : undefined
                      }
                    />
                    {fieldState.invalid && (
                      <FieldError id={errorId} errors={[fieldState.error]} />
                    )}
                  </Field>
                )
              }}
            />

            <Controller
              name="message"
              control={form.control}
              render={({ field, fieldState }) => {
                const errorId = "contact-message-error"

                return (
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
                        className="min-h-40 resize-y"
                        placeholder={t("fields.message.placeholder")}
                        aria-invalid={fieldState.invalid}
                        aria-describedby={
                          fieldState.invalid ? errorId : undefined
                        }
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
                      <FieldError id={errorId} errors={[fieldState.error]} />
                    )}
                  </Field>
                )
              }}
            />
          </FieldGroup>
        </fieldset>

        <div
          className={cn(
            "mt-6 flex min-w-0 flex-col-reverse gap-3 sm:flex-row sm:justify-end",
            actionsClassName
          )}
        >
          {cancelLabel && onCancel && (
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full sm:w-auto"
              disabled={isSubmitting}
              onClick={onCancel}
            >
              {cancelLabel}
            </Button>
          )}
          <Button
            type="submit"
            className="min-h-11 w-full sm:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            )}
            {isSubmitting ? loadingLabel : submitLabel}
          </Button>
        </div>

        {announcement && (
          <p
            className="sr-only"
            role={announcement.kind === "error" ? "alert" : "status"}
            aria-live={announcement.kind === "error" ? "assertive" : "polite"}
            aria-atomic="true"
          >
            {announcement.message}
          </p>
        )}
      </form>
    </div>
  )
}
