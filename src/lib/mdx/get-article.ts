import "server-only"

import { cache } from "react"

import { z } from "zod"

import {
  createArticleSummary,
  type Article,
  type ArticleSource,
  type ArticleSummary,
} from "@/features/articles/domain/article"
import {
  articleFilePattern,
  getArticleSlugFromFileName,
  parseArticle,
  validateArticleSlug,
  type ArticleRuntimeMode,
} from "@/features/articles/domain/article-parser"
import { mergeArticles } from "@/features/articles/domain/article-policy"
import { createLocalArticleSource } from "@/features/articles/server/local-article-source"
import { routing } from "@/i18n/routing"

export type AppLocale = (typeof routing.locales)[number]

const optionalString = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value
  }

  const normalizedValue = value.trim()
  return normalizedValue.length > 0 ? normalizedValue : undefined
}, z.string().optional())

const mdxEnvironmentSchema = z.object({
  MDX_CONTENT_SOURCE: z.enum(["local", "remote", "hybrid"]).default("local"),
  MDX_REVALIDATE_SECONDS: z.coerce.number().int().nonnegative().default(3600),
  MDX_REMOTE_BASE_URL: z.preprocess((value) => {
    if (typeof value !== "string") {
      return value
    }

    const normalizedValue = value.trim()
    return normalizedValue.length > 0 ? normalizedValue : undefined
  }, z.string().url().optional()),
  MDX_REMOTE_TOKEN: optionalString,
})

const environmentResult = mdxEnvironmentSchema.safeParse(process.env)

if (!environmentResult.success) {
  throw new Error(
    `Invalid MDX environment configuration:\n${environmentResult.error.message}`
  )
}

const mdxEnvironment = environmentResult.data

const remoteIndexSchema = z
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

function getArticleRuntimeMode(): ArticleRuntimeMode {
  switch (process.env.NODE_ENV) {
    case "production":
      return "production"
    case "test":
      return "test"
    default:
      return "development"
  }
}

const localArticleSource = createLocalArticleSource({
  getRuntimeMode: getArticleRuntimeMode,
})

function createRemoteUrl(remoteBaseUrl: string, relativePath: string): URL {
  const normalizedBaseUrl = remoteBaseUrl.endsWith("/")
    ? remoteBaseUrl
    : `${remoteBaseUrl}/`

  return new URL(relativePath, normalizedBaseUrl)
}

function createRemoteHeaders(): HeadersInit {
  return {
    Accept: "text/markdown, text/plain, application/json;q=0.9, */*;q=0.8",
    ...(mdxEnvironment.MDX_REMOTE_TOKEN
      ? { Authorization: `Bearer ${mdxEnvironment.MDX_REMOTE_TOKEN}` }
      : {}),
  }
}

function parseRepositoryArticle({
  rawArticle,
  locale,
  slug,
  source,
}: {
  rawArticle: string
  locale: AppLocale
  slug: string
  source: ArticleSource
}): Article | null {
  return parseArticle({
    rawArticle,
    locale,
    slug,
    source,
    runtimeMode: getArticleRuntimeMode(),
  })
}

async function fetchRemoteArticleFile(
  remoteBaseUrl: string,
  locale: AppLocale,
  fileName: string
): Promise<string | null> {
  const articleUrl = createRemoteUrl(remoteBaseUrl, `${locale}/${fileName}`)
  const response = await fetch(articleUrl, {
    headers: createRemoteHeaders(),
    next: {
      revalidate: mdxEnvironment.MDX_REVALIDATE_SECONDS,
      tags: [`article:${locale}:${getArticleSlugFromFileName(fileName)}`],
    },
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(
      `Could not load remote article "${locale}/${fileName}": ${response.status} ${response.statusText}`
    )
  }

  return response.text()
}

async function readRemoteArticleBySlug(
  remoteBaseUrl: string,
  locale: AppLocale,
  slug: string
): Promise<Article | null> {
  const possibleFileNames = [`${slug}.mdx`, `${slug}.md`]

  for (const fileName of possibleFileNames) {
    const rawArticle = await fetchRemoteArticleFile(
      remoteBaseUrl,
      locale,
      fileName
    )

    if (!rawArticle) {
      continue
    }

    return parseRepositoryArticle({
      rawArticle,
      locale,
      slug,
      source: "remote",
    })
  }

  return null
}

async function listRemoteArticleFileNames(
  remoteBaseUrl: string,
  locale: AppLocale
): Promise<string[] | null> {
  const indexUrl = createRemoteUrl(remoteBaseUrl, `${locale}/index.json`)
  const response = await fetch(indexUrl, {
    headers: createRemoteHeaders(),
    next: {
      revalidate: mdxEnvironment.MDX_REVALIDATE_SECONDS,
      tags: [`articles:${locale}`],
    },
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(
      `Could not load remote article index for "${locale}": ${response.status} ${response.statusText}`
    )
  }

  const indexResult = remoteIndexSchema.safeParse(await response.json())

  if (!indexResult.success) {
    throw new Error(
      `Invalid remote article index for "${locale}":\n${indexResult.error.message}`
    )
  }

  return Array.from(new Set(indexResult.data))
}

async function listRemoteArticles(
  remoteBaseUrl: string,
  locale: AppLocale
): Promise<Article[]> {
  const fileNames = await listRemoteArticleFileNames(remoteBaseUrl, locale)

  if (!fileNames) {
    return []
  }

  const articles = await Promise.all(
    fileNames.map(async (fileName) => {
      const slug = getArticleSlugFromFileName(fileName)
      const rawArticle = await fetchRemoteArticleFile(
        remoteBaseUrl,
        locale,
        fileName
      )

      if (!rawArticle) {
        throw new Error(
          `Remote index references a missing article: "${locale}/${fileName}"`
        )
      }

      return parseRepositoryArticle({
        rawArticle,
        locale,
        slug,
        source: "remote",
      })
    })
  )

  return articles.filter((article): article is Article => article !== null)
}

async function loadArticles(locale: AppLocale): Promise<ArticleSummary[]> {
  const {
    MDX_CONTENT_SOURCE: contentSource,
    MDX_REMOTE_BASE_URL: remoteBaseUrl,
  } = mdxEnvironment

  let articles: Article[]

  switch (contentSource) {
    case "local": {
      articles = await localArticleSource.list(locale)
      break
    }
    case "remote": {
      if (!remoteBaseUrl) {
        throw new Error(
          'MDX_REMOTE_BASE_URL is required when MDX_CONTENT_SOURCE is "remote".'
        )
      }

      articles = await listRemoteArticles(remoteBaseUrl, locale)
      break
    }
    case "hybrid": {
      const localArticlesPromise = localArticleSource.list(locale)
      const remoteArticlesPromise = remoteBaseUrl
        ? listRemoteArticles(remoteBaseUrl, locale)
        : Promise.resolve([])
      const [localArticles, remoteArticles] = await Promise.all([
        localArticlesPromise,
        remoteArticlesPromise,
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
  validateArticleSlug(slug)

  const {
    MDX_CONTENT_SOURCE: contentSource,
    MDX_REMOTE_BASE_URL: remoteBaseUrl,
  } = mdxEnvironment

  switch (contentSource) {
    case "local": {
      return localArticleSource.get(locale, slug)
    }
    case "remote": {
      if (!remoteBaseUrl) {
        throw new Error(
          'MDX_REMOTE_BASE_URL is required when MDX_CONTENT_SOURCE is "remote".'
        )
      }

      return readRemoteArticleBySlug(remoteBaseUrl, locale, slug)
    }
    case "hybrid": {
      if (remoteBaseUrl) {
        const remoteArticle = await readRemoteArticleBySlug(
          remoteBaseUrl,
          locale,
          slug
        )

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
