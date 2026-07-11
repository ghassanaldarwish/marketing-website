import { z } from "zod"

const datePattern = /^\d{4}-\d{2}-\d{2}$/

export const articleMetadataSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),

  publishedAt: z.string().regex(datePattern, {
    message: "publishedAt must use YYYY-MM-DD",
  }),

  updatedAt: z
    .string()
    .regex(datePattern, {
      message: "updatedAt must use YYYY-MM-DD",
    })
    .optional(),

  coverImage: z.string().min(1).optional(),
  coverImageAlt: z.string().min(1).optional(),

  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  translationKey: z.string().optional(),
})

export type ArticleMetadata = z.infer<typeof articleMetadataSchema>

export type Article = {
  metadata: ArticleMetadata
  body: string
}
