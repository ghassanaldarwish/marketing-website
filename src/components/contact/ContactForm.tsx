"use client"

import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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

import type { ContactFormType } from "@/lib/validation"
import { contactFormSchema } from "@/lib/validation"
import { submitContactForm } from "@/actions/contact"

type ContactFormProps = {
  setIsOpen?: (open: boolean) => void
}

export function ContactForm({ setIsOpen }: ContactFormProps) {
  const form = useForm<ContactFormType>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  })

  async function onSubmit(data: ContactFormType) {
    console.log(data)
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value)
    })

    const result = await submitContactForm(formData)

    if ("success" in result) {
      toast.success("Message sent successfully!")

      form.reset()
      setIsOpen?.(false)
    } else {
      toast.error("Error" + result.error)
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
                <FieldLabel htmlFor="contact-name">Full Name</FieldLabel>

                <Input
                  {...field}
                  id="contact-name"
                  placeholder="John Doe"
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
                <FieldLabel htmlFor="contact-email">Email Address</FieldLabel>

                <Input
                  {...field}
                  id="contact-email"
                  type="email"
                  placeholder="john@example.com"
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
                <FieldLabel htmlFor="contact-message">Message</FieldLabel>

                <InputGroup>
                  <InputGroupTextarea
                    {...field}
                    id="contact-message"
                    rows={8}
                    maxLength={5000}
                    className="min-h-40 resize-none"
                    placeholder="Tell me about your project, idea, or opportunity..."
                    aria-invalid={fieldState.invalid}
                  />

                  <InputGroupAddon align="block-end">
                    <InputGroupText className="tabular-nums">
                      {field.value.length}/5000
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
