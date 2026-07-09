// src/actions/register-child.ts
"use server"
import { contactFormSchema } from "@/lib/validation"
import { sendTelegramMessage } from "@/lib/telegram"

export async function submitContactForm(formData: FormData) {
  try {
    const values = Object.fromEntries(formData.entries())

    const parsed = contactFormSchema.safeParse({
      ...values,
    })

    if (!parsed.success) {
      console.error("Validation error", parsed.error.flatten().fieldErrors)
      return { error:"Validation error"}
    }

        const message = `✅ *New Message From Website*
     *Name:* ${parsed.data.name}
     *Email:* ${parsed.data.email}
     *Message* ${parsed.data.message}`;

    await sendTelegramMessage(message);
    return { success: true }
  } catch (e) {
    console.error("Upload failed:", e)
    return { error: "Error" }
  }
}
