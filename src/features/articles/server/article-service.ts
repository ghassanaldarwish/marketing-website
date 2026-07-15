import "server-only"

import {
  createArticleSummary,
  type Article,
  type ArticleSummary,
} from "@/features/articles/domain/article"
import type { ArticleRepository } from "@/features/articles/server/article-repository"
import { createHybridArticleSource } from "@/features/articles/server/hybrid-article-source"

export type ArticleContentSource = "local" | "remote" | "hybrid"

export type ArticleServiceConfiguration = {
  contentSource: ArticleContentSource
}

export type ArticleServiceDependencies = {
  localSource: ArticleRepository
  remoteSource?: ArticleRepository
}

export type ArticleService = {
  getArticles(locale: string): Promise<ArticleSummary[]>
  getArticle(locale: string, slug: string): Promise<Article | null>
}

function requireRemoteSource(
  remoteSource: ArticleRepository | undefined,
  contentSource: "remote" | "hybrid"
): ArticleRepository {
  if (!remoteSource) {
    throw new Error(
      `MDX_REMOTE_BASE_URL is required when MDX_CONTENT_SOURCE is "${contentSource}".`
    )
  }

  return remoteSource
}

export function selectArticleSource(
  configuration: ArticleServiceConfiguration,
  dependencies: ArticleServiceDependencies
): ArticleRepository {
  switch (configuration.contentSource) {
    case "local":
      return dependencies.localSource

    case "remote":
      return requireRemoteSource(dependencies.remoteSource, "remote")

    case "hybrid":
      return createHybridArticleSource({
        localSource: dependencies.localSource,
        remoteSource: requireRemoteSource(dependencies.remoteSource, "hybrid"),
      })
  }
}

export function createArticleService(
  configuration: ArticleServiceConfiguration,
  dependencies: ArticleServiceDependencies
): ArticleService {
  const articleSource = selectArticleSource(configuration, dependencies)

  async function getArticles(locale: string): Promise<ArticleSummary[]> {
    const articles = await articleSource.list(locale)

    return articles.map(createArticleSummary)
  }

  async function getArticle(
    locale: string,
    slug: string
  ): Promise<Article | null> {
    return articleSource.get(locale, slug)
  }

  return {
    getArticles,
    getArticle,
  }
}
