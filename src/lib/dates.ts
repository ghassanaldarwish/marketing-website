import type { ArticleSummary } from "@/lib/mdx/article-schema"

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

function parseDateOnly(value: string): Date | undefined {
  const match = DATE_ONLY_PATTERN.exec(value)

  if (!match) {
    return undefined
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return undefined
  }

  return date
}

export function toIsoDate(value: string): string | undefined {
  return parseDateOnly(value)?.toISOString()
}

export function getArticleDateValue(article: ArticleSummary): string {
  return article.metadata.updatedAt ?? article.metadata.publishedAt
}

export function getArticleLastModified(
  article: ArticleSummary
): Date | undefined {
  return parseDateOnly(getArticleDateValue(article))
}
