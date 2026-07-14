"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { submitContactForm, type ContactFormErrorCode } from "@/actions/contact"
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
  contactFormSchema,
  type ContactFormType,
} from "@/features/contact/contact-schema"

type ContactFormProps = {
  onSuccess?: () => void
}

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

  function getBackendErrorMessage(errorCode: ContactFormErrorCode): string {
    switch (errorCode) {
      case "VALIDATION_ERROR":
        return t("toast.validationError")
      case "DELIVERY_ERROR":
        return t("toast.deliveryError")
      default: {
        const exhaustiveCheck: never = errorCode
        return exhaustiveCheck
      }
    }
  }

  async function onSubmit(data: ContactFormType) {
    try {
      const formData = new FormData()

      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value)
      })

      const result = await submitContactForm(formData)

      if (result.success) {
        toast.success(t("toast.success"))
        form.reset()
        onSuccess?.()
        return
      }

      toast.error(getBackendErrorMessage(result.errorCode))
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
