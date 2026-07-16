import type {
  Article,
  ArticleSummary,
} from "@/features/articles/domain/article"

type SortableArticle = Article | ArticleSummary

function compareArticles(
  first: SortableArticle,
  second: SortableArticle
): number {
  if (first.metadata.featured !== second.metadata.featured) {
    return first.metadata.featured ? -1 : 1
  }

  const firstOrder = first.metadata.order ?? Number.MAX_SAFE_INTEGER
  const secondOrder = second.metadata.order ?? Number.MAX_SAFE_INTEGER

  if (firstOrder !== secondOrder) {
    return firstOrder - secondOrder
  }

  const firstDate = new Date(
    `${first.metadata.publishedAt}T00:00:00.000Z`
  ).getTime()
  const secondDate = new Date(
    `${second.metadata.publishedAt}T00:00:00.000Z`
  ).getTime()

  if (firstDate !== secondDate) {
    return secondDate - firstDate
  }

  return first.metadata.title.localeCompare(second.metadata.title)
}

export function sortArticles<T extends SortableArticle>(
  articles: readonly T[]
): T[] {
  return [...articles].sort(compareArticles)
}

export function mergeArticles({
  localArticles,
  remoteArticles,
}: {
  localArticles: readonly Article[]
  remoteArticles: readonly Article[]
}): Article[] {
  const articlesBySlug = new Map<string, Article>()

  for (const article of localArticles) {
    articlesBySlug.set(article.slug, article)
  }

  for (const article of remoteArticles) {
    articlesBySlug.set(article.slug, article)
  }

  return sortArticles(Array.from(articlesBySlug.values()))
}
