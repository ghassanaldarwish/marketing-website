import "server-only"

import { mergeArticles } from "@/features/articles/domain/article-policy"
import type { ArticleRepository } from "@/features/articles/server/article-repository"

export type HybridArticleSourceOptions = {
  localSource: ArticleRepository
  remoteSource: ArticleRepository
}

/**
 * Combines the local and remote article repositories.
 *
 * Precedence rules:
 *
 * - List operations load both repositories concurrently.
 * - When a localized slug exists in both repositories, the remote article
 *   replaces the local article.
 * - Detail operations check the remote repository first and use the local
 *   repository only when the remote article does not exist.
 *
 * List ordering and duplicate resolution are delegated to the shared article
 * domain policy.
 */
export function createHybridArticleSource({
  localSource,
  remoteSource,
}: HybridArticleSourceOptions): ArticleRepository {
  async function list(locale: string) {
    const [localArticles, remoteArticles] = await Promise.all([
      localSource.list(locale),
      remoteSource.list(locale),
    ])

    return mergeArticles({
      localArticles,
      remoteArticles,
    })
  }

  async function get(locale: string, slug: string) {
    const remoteArticle = await remoteSource.get(locale, slug)

    if (remoteArticle) {
      return remoteArticle
    }

    return localSource.get(locale, slug)
  }

  return {
    list,
    get,
  }
}
