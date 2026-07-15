import "server-only"

import { cache } from "react"

import {
  createArticleSummary,
  type Article,
  type ArticleSummary,
} from "@/features/articles/domain/article"
import { mergeArticles } from "@/features/articles/domain/article-policy"
import {
  articleEnvironment,
  getArticleRuntimeMode,
} from "@/features/articles/server/article-env"
import { createLocalArticleSource } from "@/features/articles/server/local-article-source"
import {
  createRemoteArticleSource,
  type RemoteArticleSource,
} from "@/features/articles/server/remote-article-source"
import { routing } from "@/i18n/routing"

export type AppLocale = (typeof routing.locales)[number]

const localArticleSource = createLocalArticleSource({
  getRuntimeMode: getArticleRuntimeMode,
})

const remoteArticleSource = articleEnvironment.remoteBaseUrl
  ? createRemoteArticleSource({
      baseUrl: articleEnvironment.remoteBaseUrl,
      token: articleEnvironment.remoteToken,
      revalidateSeconds: articleEnvironment.revalidateSeconds,
      timeoutMs: articleEnvironment.remoteTimeoutMs,
      getRuntimeMode: getArticleRuntimeMode,
    })
  : null

function requireRemoteArticleSource(): RemoteArticleSource {
  if (!remoteArticleSource) {
    throw new Error(
      'MDX_REMOTE_BASE_URL is required when MDX_CONTENT_SOURCE is "remote".'
    )
  }

  return remoteArticleSource
}

async function loadArticles(locale: AppLocale): Promise<ArticleSummary[]> {
  let articles: Article[]

  switch (articleEnvironment.contentSource) {
    case "local": {
      articles = await localArticleSource.list(locale)
      break
    }
    case "remote": {
      articles = await requireRemoteArticleSource().list(locale)
      break
    }
    case "hybrid": {
      const [localArticles, remoteArticles] = await Promise.all([
        localArticleSource.list(locale),
        remoteArticleSource
          ? remoteArticleSource.list(locale)
          : Promise.resolve([]),
      ])

      articles = mergeArticles({ localArticles, remoteArticles })
      break
    }
  }

  return articles.map(createArticleSummary)
}

async function loadArticle(
  locale: AppLocale,
  slug: string
): Promise<Article | null> {
  switch (articleEnvironment.contentSource) {
    case "local":
      return localArticleSource.get(locale, slug)
    case "remote":
      return requireRemoteArticleSource().get(locale, slug)
    case "hybrid": {
      if (remoteArticleSource) {
        const remoteArticle = await remoteArticleSource.get(locale, slug)

        if (remoteArticle) {
          return remoteArticle
        }
      }

      return localArticleSource.get(locale, slug)
    }
  }
}

export const getArticles = cache(loadArticles)
export const getArticle = cache(loadArticle)
