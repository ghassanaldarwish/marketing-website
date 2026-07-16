import { z } from "zod"

export type ContactValidationMessages = {
  nameMin: string
  emailInvalid: string
  messageMin: string
  messageMax: string
}

export function createContactFormSchema(messages: ContactValidationMessages) {
  return z.object({
    name: z.string().trim().min(2, messages.nameMin),
    email: z.string().trim().email(messages.emailInvalid),
    message: z
      .string()
      .trim()
      .min(10, messages.messageMin)
      .max(5000, messages.messageMax),
    website: z.string().trim().optional().default(""),
  })
}

const serverValidationMessages: ContactValidationMessages = {
  nameMin: "NAME_TOO_SHORT",
  emailInvalid: "EMAIL_INVALID",
  messageMin: "MESSAGE_TOO_SHORT",
  messageMax: "MESSAGE_TOO_LONG",
}

export const contactFormSchema = createContactFormSchema(
  serverValidationMessages
)

export type ContactFormInput = z.input<typeof contactFormSchema>
export type ContactFormType = z.infer<typeof contactFormSchema>
