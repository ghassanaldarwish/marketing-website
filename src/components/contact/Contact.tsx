"use client"

import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import * as z from "zod"
import { useTranslations } from "next-intl"

import {
  Field,
  FieldDescription,
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
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "../ui/button"
import { ContactForm, contactFormSchema } from "@/lib/validation"
import { submitContactForm } from "@/actions/contact"



export function ContactModel() {
  const [isOpen, setIsOpen] = React.useState(false)
  const t = useTranslations("hero")
  const contact = t("contact")

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  })

  async function onSubmit(data: ContactForm) {
    console.log(data)
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

   const result = await submitContactForm(formData);

    if ("success" in result) {
    toast.success("Message sent successfully!")

    form.reset()
    setIsOpen(false)

    } else {
      toast.error("فشل الإرسال: " + result.error);
    }



  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button size="lg" className="text-lg">
          {contact}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="data-[size=default]:max-w-[calc(100%-2rem)] data-[size=default]:sm:max-w-[calc(100%-2rem)] data-[size=default]:md:max-w-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Get in Touch</AlertDialogTitle>

          <AlertDialogDescription>
            Have a project, job opportunity, or technical question? Send me a
            message.
          </AlertDialogDescription>

          <div className="w-full">
            <form id="contact-form" onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="contact-name">
                        Full Name
                      </FieldLabel>

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
                      <FieldLabel htmlFor="contact-email">
                        Email Address
                      </FieldLabel>

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

                      <FieldDescription>
                        Briefly describe your project or how I can help.
                      </FieldDescription>

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </form>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <Button type="submit" form="contact-form">
            Send Message
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}