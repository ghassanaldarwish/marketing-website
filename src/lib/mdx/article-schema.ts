import { z } from "zod"

const datePattern = /^\d{4}-\d{2}-\d{2}$/

export const articleIconSchema = z.enum([
  "brain",
  "server",
  "workflow",
  "layers",
  "cloud",
  "code",
])

export const articleMetadataSchema = z.object({
  title: z.string().min(1),

  description: z.string().min(1),

  category: z.string().min(1),

  status: z.string().min(1).default("Case Study"),

  publishedAt: z.string().regex(datePattern, {
    message: "publishedAt must use YYYY-MM-DD",
  }),

  updatedAt: z
    .string()
    .regex(datePattern, {
      message: "updatedAt must use YYYY-MM-DD",
    })
    .optional(),

  /**
   * Local:
   * /articles/ai-agent-platform/cover.png
   *
   * Remote:
   * https://cdn.example.com/articles/cover.png
   */
  coverImage: z.string().min(1),

  coverImageAlt: z.string().min(1),

  tags: z.array(z.string()).default([]),

  stack: z.array(z.string()).default([]),

  icon: articleIconSchema.default("code"),

  featured: z.boolean().default(false),

  /**
   * Lower values appear first.
   *
   * Featured articles still appear before non-featured
   * articles.
   */
  order: z.number().int().nonnegative().optional(),

  draft: z.boolean().default(false),

  translationKey: z.string().optional(),
})

export type ArticleIcon = z.infer<typeof articleIconSchema>

export type ArticleMetadata = z.infer<typeof articleMetadataSchema>

export type ArticleSource = "local" | "remote"

export type Article = {
  slug: string
  locale: string
  source: ArticleSource
  metadata: ArticleMetadata
  body: string
}

export type ArticleSummary = Omit<Article, "body">
