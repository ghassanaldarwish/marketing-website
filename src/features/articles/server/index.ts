import "server-only"

import path from "node:path"

import { cache } from "react"

import {
  articleEnvironment,
  getArticleRuntimeMode,
} from "@/features/articles/server/article-env"
import { createArticleService } from "@/features/articles/server/article-service"
import { createLocalArticleSource } from "@/features/articles/server/local-article-source"
import {
  createRemoteArticleSource,
  type RemoteArticleSource,
} from "@/features/articles/server/remote-article-source"
import { routing } from "@/i18n/routing"

export type AppLocale = (typeof routing.locales)[number]

const localArticleSource = createLocalArticleSource({
  contentDirectory: path.join(process.cwd(), "content", "articles"),
  getRuntimeMode: getArticleRuntimeMode,
})

function createConfiguredRemoteSource(): RemoteArticleSource | undefined {
  if (!articleEnvironment.remoteBaseUrl) {
    return undefined
  }

  return createRemoteArticleSource({
    baseUrl: articleEnvironment.remoteBaseUrl,
    token: articleEnvironment.remoteToken,
    revalidateSeconds: articleEnvironment.revalidateSeconds,
    timeoutMs: articleEnvironment.remoteTimeoutMs,
    getRuntimeMode: getArticleRuntimeMode,
  })
}

const articleService = createArticleService(
  {
    contentSource: articleEnvironment.contentSource,
  },
  {
    localSource: localArticleSource,
    remoteSource: createConfiguredRemoteSource(),
  }
)

async function loadArticles(locale: AppLocale) {
  return articleService.getArticles(locale)
}

async function loadArticle(locale: AppLocale, slug: string) {
  return articleService.getArticle(locale, slug)
}

export const getArticles = cache(loadArticles)
export const getArticle = cache(loadArticle)
