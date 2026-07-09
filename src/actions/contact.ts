// src/actions/register-child.ts
"use server"
import { contactMessageSchema } from "@/lib/validation"
import { sendTelegramMessage } from "@/lib/telegram"

export async function submitChildRegistration(formData: FormData) {
  try {
    const values = Object.fromEntries(formData.entries())

    const parsed = contactMessageSchema.safeParse({
      ...values,
    })

    if (!parsed.success) {
      console.error("Validation error", parsed.error.flatten().fieldErrors)
      return { error: "بيانات غير صالحة" }
    }

    //     const message = `🧒 *طفل جديد تم تسجيله!*
    // 👶 *اسم الطفل:* ${parsed.data.childName}
    // 👨‍👧 *رقم والد الطفل:* ${parsed.data.fatherPhone}
    // ✅ *مواليد الطفل:* ${parsed.data.childBirthdate}`;

    //     await sendTelegramMessage(message);
    return { success: true }
  } catch (e) {
    console.error("Upload failed:", e)
    return { error: "حدث خطأ أثناء حفظ الملف" }
  }
}
