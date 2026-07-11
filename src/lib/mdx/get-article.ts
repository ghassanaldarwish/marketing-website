import "server-only"

import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { cache } from "react"

import matter from "gray-matter"
import { z } from "zod"

import { routing } from "@/i18n/routing"
import {
  articleMetadataSchema,
  type Article,
  type ArticleSource,
  type ArticleSummary,
} from "@/lib/mdx/article-schema"

export type AppLocale = (typeof routing.locales)[number]

type ContentSource = "local" | "remote" | "hybrid"

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const articleFilePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*\.(?:md|mdx)$/

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

function validateSlug(slug: string): void {
  if (!slugPattern.test(slug)) {
    throw new Error(`Invalid article slug: "${slug}"`)
  }
}

function getSlugFromFileName(fileName: string): string {
  if (!articleFilePattern.test(fileName)) {
    throw new Error(`Invalid article filename: "${fileName}"`)
  }

  const extension = path.extname(fileName)
  const slug = path.basename(fileName, extension)

  validateSlug(slug)

  return slug
}

function getLocalArticleDirectory(locale: AppLocale): string {
  return path.join(process.cwd(), "content", "articles", locale)
}

function getLocalArticleFilePath(locale: AppLocale, fileName: string): string {
  return path.join(getLocalArticleDirectory(locale), fileName)
}

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
      ? {
          Authorization: `Bearer ${mdxEnvironment.MDX_REMOTE_TOKEN}`,
        }
      : {}),
  }
}

function parseArticle({
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
  const { data, content } = matter(rawArticle)

  const metadataResult = articleMetadataSchema.safeParse(data)

  if (!metadataResult.success) {
    throw new Error(
      `Invalid frontmatter in article "${locale}/${slug}":\n${metadataResult.error.message}`
    )
  }

  const metadata = metadataResult.data

  if (metadata.draft && process.env.NODE_ENV === "production") {
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

async function listLocalArticleFileNames(locale: AppLocale): Promise<string[]> {
  const directory = getLocalArticleDirectory(locale)

  try {
    const entries = await readdir(directory, {
      withFileTypes: true,
    })

    return entries
      .filter((entry) => entry.isFile() && articleFilePattern.test(entry.name))
      .map((entry) => entry.name)
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException

    if (nodeError.code === "ENOENT") {
      return []
    }

    throw new Error(
      `Could not list local articles for "${locale}": ${
        nodeError.message || "Unknown filesystem error"
      }`
    )
  }
}

async function readLocalArticleFile(
  locale: AppLocale,
  fileName: string
): Promise<string> {
  const filePath = getLocalArticleFilePath(locale, fileName)

  try {
    return await readFile(filePath, "utf8")
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException

    throw new Error(
      `Could not read local article "${locale}/${fileName}": ${
        nodeError.message || "Unknown filesystem error"
      }`
    )
  }
}

async function readLocalArticleBySlug(
  locale: AppLocale,
  slug: string
): Promise<Article | null> {
  const possibleFileNames = [`${slug}.mdx`, `${slug}.md`]

  for (const fileName of possibleFileNames) {
    try {
      const rawArticle = await readLocalArticleFile(locale, fileName)

      return parseArticle({
        rawArticle,
        locale,
        slug,
        source: "local",
      })
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException

      /**
       * readLocalArticleFile wraps errors, so inspect
       * whether the original message represents a
       * missing file.
       */
      if (nodeError.code === "ENOENT" || String(error).includes("ENOENT")) {
        continue
      }

      throw error
    }
  }

  return null
}

async function listLocalArticles(locale: AppLocale): Promise<Article[]> {
  const fileNames = await listLocalArticleFileNames(locale)

  const articles = await Promise.all(
    fileNames.map(async (fileName) => {
      const slug = getSlugFromFileName(fileName)

      const rawArticle = await readLocalArticleFile(locale, fileName)

      return parseArticle({
        rawArticle,
        locale,
        slug,
        source: "local",
      })
    })
  )

  return articles.filter((article): article is Article => article !== null)
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

      tags: [`article:${locale}:${getSlugFromFileName(fileName)}`],
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

    return parseArticle({
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
      const slug = getSlugFromFileName(fileName)

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

      return parseArticle({
        rawArticle,
        locale,
        slug,
        source: "remote",
      })
    })
  )

  return articles.filter((article): article is Article => article !== null)
}

function sortArticles(first: Article, second: Article): number {
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

function mergeArticles({
  localArticles,
  remoteArticles,
}: {
  localArticles: Article[]
  remoteArticles: Article[]
}): Article[] {
  const articlesBySlug = new Map<string, Article>()

  /**
   * Add local first.
   */
  for (const article of localArticles) {
    articlesBySlug.set(article.slug, article)
  }

  /**
   * Remote articles override local articles with
   * the same filename/slug.
   */
  for (const article of remoteArticles) {
    articlesBySlug.set(article.slug, article)
  }

  return Array.from(articlesBySlug.values()).sort(sortArticles)
}

async function loadArticles(locale: AppLocale): Promise<ArticleSummary[]> {
  const {
    MDX_CONTENT_SOURCE: contentSource,
    MDX_REMOTE_BASE_URL: remoteBaseUrl,
  } = mdxEnvironment

  let articles: Article[]

  switch (contentSource) {
    case "local": {
      articles = await listLocalArticles(locale)

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
      const localArticlesPromise = listLocalArticles(locale)

      const remoteArticlesPromise = remoteBaseUrl
        ? listRemoteArticles(remoteBaseUrl, locale)
        : Promise.resolve([])

      const [localArticles, remoteArticles] = await Promise.all([
        localArticlesPromise,
        remoteArticlesPromise,
      ])

      articles = mergeArticles({
        localArticles,
        remoteArticles,
      })

      break
    }
  }

  return articles.map(({ body: _body, ...summary }) => summary)
}

async function loadArticle(
  locale: AppLocale,
  slug: string
): Promise<Article | null> {
  validateSlug(slug)

  const {
    MDX_CONTENT_SOURCE: contentSource,
    MDX_REMOTE_BASE_URL: remoteBaseUrl,
  } = mdxEnvironment

  switch (contentSource) {
    case "local": {
      return readLocalArticleBySlug(locale, slug)
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

      return readLocalArticleBySlug(locale, slug)
    }
  }
}

export const getArticles = cache(loadArticles)

export const getArticle = cache(loadArticle)
