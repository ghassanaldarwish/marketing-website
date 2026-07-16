import matter from "gray-matter"
import { z } from "zod"

import {
  articleMetadataSchema,
  type Article,
  type ArticleSource,
} from "@/features/articles/domain/article"

const articleSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
export const articleFilePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*\.(?:md|mdx)$/

const remoteArticleIndexSchema = z
  .union([
    z.array(
      z.string().regex(articleFilePattern, {
        message:
          "Remote article filenames must use kebab-case and end in .md or .mdx",
      })
    ),
    z.object({
      files: z.array(
        z.string().regex(articleFilePattern, {
          message:
            "Remote article filenames must use kebab-case and end in .md or .mdx",
        })
      ),
    }),
  ])
  .transform((value) => (Array.isArray(value) ? value : value.files))

export type ArticleRuntimeMode = "development" | "production" | "test"

export type ArticleDomainErrorCode =
  | "INVALID_ARTICLE_SLUG"
  | "INVALID_ARTICLE_FILENAME"
  | "INVALID_ARTICLE_FRONTMATTER"

export class ArticleDomainError extends Error {
  readonly code: ArticleDomainErrorCode

  constructor(code: ArticleDomainErrorCode, message: string) {
    super(message)
    this.name = "ArticleDomainError"
    this.code = code
  }
}

export function validateArticleSlug(slug: string): void {
  if (!articleSlugPattern.test(slug)) {
    throw new ArticleDomainError(
      "INVALID_ARTICLE_SLUG",
      `Invalid article slug: "${slug}"`
    )
  }
}

export function getArticleSlugFromFileName(fileName: string): string {
  if (!articleFilePattern.test(fileName)) {
    throw new ArticleDomainError(
      "INVALID_ARTICLE_FILENAME",
      `Invalid article filename: "${fileName}"`
    )
  }

  const extensionIndex = fileName.lastIndexOf(".")
  const slug = fileName.slice(0, extensionIndex)

  validateArticleSlug(slug)

  return slug
}

export function parseRemoteArticleIndex(value: unknown): string[] {
  return remoteArticleIndexSchema.parse(value)
}

export function parseArticle({
  rawArticle,
  locale,
  slug,
  source,
  runtimeMode,
}: {
  rawArticle: string
  locale: string
  slug: string
  source: ArticleSource
  runtimeMode: ArticleRuntimeMode
}): Article | null {
  validateArticleSlug(slug)

  const { data, content } = matter(rawArticle)
  const metadataResult = articleMetadataSchema.safeParse(data)

  if (!metadataResult.success) {
    throw new ArticleDomainError(
      "INVALID_ARTICLE_FRONTMATTER",
      `Invalid frontmatter in article "${locale}/${slug}":\n${metadataResult.error.message}`
    )
  }

  const metadata = metadataResult.data

  if (metadata.draft && runtimeMode === "production") {
    return null
  }

  return {
    slug,
    locale,
    source,
    metadata,
    body: content,
  }
}
