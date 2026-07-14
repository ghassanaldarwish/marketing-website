"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
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
  type SubmitContactFormResult,
} from "@/features/contact/contact-result"
import {
  contactFormSchema,
  type ContactFormType,
} from "@/features/contact/contact-schema"
import { submitContactForm } from "@/features/contact/server/submit-contact-form"

type ContactFormProps = {
  onSuccess?: () => void
}

const contactFields: ContactField[] = ["name", "email", "message"]

export function ContactForm({ onSuccess }: ContactFormProps) {
  const t = useTranslations("contact.form")

  const form = useForm<ContactFormType>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  })

  function applyServerFieldErrors(fieldErrors: ContactFieldErrors): void {
    for (const field of contactFields) {
      if (!fieldErrors[field]?.length) {
        continue
      }

      form.setError(field, {
        type: "server",
        message: t("toast.validationError"),
      })
    }
  }

  function handleSubmissionResult(result: SubmitContactFormResult): void {
    switch (result.status) {
      case "success":
        toast.success(t("toast.success"))
        form.reset()
        onSuccess?.()
        return

      case "validation_error":
        applyServerFieldErrors(result.fieldErrors)
        toast.error(t("toast.validationError"))
        return

      case "delivery_error":
        toast.error(t("toast.deliveryError"))
        return

      case "unexpected_error":
        toast.error(t("toast.unexpectedError"))
        return

      default: {
        const exhaustiveCheck: never = result
        return exhaustiveCheck
      }
    }
  }

  async function onSubmit(data: ContactFormType) {
    try {
      const result = await submitContactForm(data)
      handleSubmissionResult(result)
    } catch {
      toast.error(t("toast.unexpectedError"))
    }
  }

  return (
    <div className="w-full">
      <form id="contact-form" onSubmit={form.handleSubmit(onSubmit)}>
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
      </form>
    </div>
  )
}
