import { z } from "zod"
import { t } from "@/lib/utils" // your translation utility

const maxWords = (value: string | undefined) =>
  !value || value.trim().split(/\s+/).length <= 1000

const wordLimitMessage = "الحد الأقصى هو ١٠٠٠ كلمة."

export const contactMessageSchema = z.object({
  childName: z
    .string()
    .nonempty(t("validation.required"))
    .min(2, "اكتب الاسم الكامل للطفل")
    .max(1000, "الحد الأقصى هو ١٠٠٠ حرف"),

  childBirthdate: z
    .string()
    .nonempty(t("validation.required"))
    .min(4, "أدخل تاريخ الميلاد")
    .max(1000, "الحد الأقصى هو ١٠٠٠ حرف"),
  fatherJob: z
    .string()
    .optional()
    .refine(maxWords, { message: wordLimitMessage }),
})

export type contactMessageForm = z.infer<typeof contactMessageSchema> // 👈 ADD THIS LINE
