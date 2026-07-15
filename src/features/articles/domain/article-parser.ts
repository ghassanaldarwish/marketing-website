import matter from "gray-matter"

import {
  articleMetadataSchema,
  type Article,
  type ArticleSource,
} from "@/features/articles/domain/article"

export const articleSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
export const articleFilePattern =
  /^[a-z0-9]+(?:-[a-z0-9]+)*\.(?:md|mdx)$/

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
