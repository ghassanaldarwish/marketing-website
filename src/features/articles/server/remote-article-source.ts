import "server-only"

import path from "node:path"

import type { Article } from "@/features/articles/domain/article"
import {
  getArticleSlugFromFileName,
  parseArticle,
  parseRemoteArticleIndex,
  validateArticleSlug,
  type ArticleRuntimeMode,
} from "@/features/articles/domain/article-parser"
import type { ArticleRepository } from "@/features/articles/server/article-repository"

const articleExtensions = [".mdx", ".md"] as const

type RemoteFetchInit = RequestInit & {
  next: {
    revalidate: number
    tags: string[]
  }
}

type RemoteArticleSourceOptions = {
  baseUrl: string | URL
  token?: string
  revalidateSeconds: number
  timeoutMs: number
  fetchImpl?: typeof fetch
  getRuntimeMode?: () => ArticleRuntimeMode
}

export type RemoteArticleSource = ArticleRepository

export type RemoteArticleSourceErrorCode =
  | "HTTP_ERROR"
  | "INVALID_INDEX"
  | "MISSING_INDEXED_ARTICLE"
  | "REQUEST_TIMEOUT"
  | "INVALID_ARTICLE"

export class RemoteArticleSourceError extends Error {
  readonly code: RemoteArticleSourceErrorCode
  readonly status?: number

  constructor({
    code,
    message,
    cause,
    status,
  }: {
    code: RemoteArticleSourceErrorCode
    message: string
    cause?: unknown
    status?: number
  }) {
    super(message, { cause })
    this.name = "RemoteArticleSourceError"
    this.code = code
    this.status = status
  }
}

function getDefaultRuntimeMode(): ArticleRuntimeMode {
  switch (process.env.NODE_ENV) {
    case "production":
      return "production"
    case "test":
      return "test"
    default:
      return "development"
  }
}

function normalizeBaseUrl(baseUrl: string | URL): URL {
  const url = new URL(baseUrl)
  url.pathname = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`
  return url
}

function preferArticleFileNames(fileNames: string[]): string[] {
  const fileNameBySlug = new Map<string, string>()

  for (const extension of articleExtensions) {
    for (const fileName of fileNames) {
      if (path.extname(fileName) !== extension) {
        continue
      }

      const slug = getArticleSlugFromFileName(fileName)

      if (!fileNameBySlug.has(slug)) {
        fileNameBySlug.set(slug, fileName)
      }
    }
  }

  return Array.from(fileNameBySlug.values())
}

export function createRemoteArticleSource({
  baseUrl,
  token,
  revalidateSeconds,
  timeoutMs,
  fetchImpl = fetch,
  getRuntimeMode = getDefaultRuntimeMode,
}: RemoteArticleSourceOptions): RemoteArticleSource {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl)

  function createUrl(relativePath: string): URL {
    return new URL(relativePath, normalizedBaseUrl)
  }

  function createHeaders(): Headers {
    const headers = new Headers({
      Accept: "text/markdown, text/plain, application/json;q=0.9, */*;q=0.8",
    })

    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }

    return headers
  }

  async function request(
    relativePath: string,
    tags: string[]
  ): Promise<Response> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
      return await fetchImpl(createUrl(relativePath), {
        headers: createHeaders(),
        signal: controller.signal,
        next: { revalidate: revalidateSeconds, tags },
      } as RemoteFetchInit)
    } catch (error) {
      if (controller.signal.aborted) {
        throw new RemoteArticleSourceError({
          code: "REQUEST_TIMEOUT",
          message: `Remote article request timed out after ${timeoutMs}ms.`,
          cause: error,
        })
      }

      throw error
    } finally {
      clearTimeout(timeout)
    }
  }

  async function fetchArticleFile(
    locale: string,
    fileName: string
  ): Promise<string | null> {
    const slug = getArticleSlugFromFileName(fileName)
    const response = await request(`${locale}/${fileName}`, [
      `article:${locale}:${slug}`,
    ])

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new RemoteArticleSourceError({
        code: "HTTP_ERROR",
        status: response.status,
        message: `Could not load remote article "${locale}/${fileName}": ${response.status} ${response.statusText}`,
      })
    }

    return response.text()
  }

  function parseRemoteArticle({
    rawArticle,
    locale,
    slug,
  }: {
    rawArticle: string
    locale: string
    slug: string
  }): Article | null {
    try {
      return parseArticle({
        rawArticle,
        locale,
        slug,
        source: "remote",
        runtimeMode: getRuntimeMode(),
      })
    } catch (error) {
      throw new RemoteArticleSourceError({
        code: "INVALID_ARTICLE",
        message: `Could not parse remote article "${locale}/${slug}".`,
        cause: error,
      })
    }
  }

  async function listFileNames(locale: string): Promise<string[]> {
    const response = await request(`${locale}/index.json`, [
      `articles:${locale}`,
    ])

    if (response.status === 404) {
      return []
    }

    if (!response.ok) {
      throw new RemoteArticleSourceError({
        code: "HTTP_ERROR",
        status: response.status,
        message: `Could not load remote article index for "${locale}": ${response.status} ${response.statusText}`,
      })
    }

    let json: unknown

    try {
      json = await response.json()
    } catch (error) {
      throw new RemoteArticleSourceError({
        code: "INVALID_INDEX",
        message: `Invalid remote article index for "${locale}".`,
        cause: error,
      })
    }

    let fileNames: string[]

    try {
      fileNames = parseRemoteArticleIndex(json)
    } catch (error) {
      throw new RemoteArticleSourceError({
        code: "INVALID_INDEX",
        message: `Invalid remote article index for "${locale}".`,
        cause: error,
      })
    }

    return preferArticleFileNames(Array.from(new Set(fileNames)))
  }

  async function list(locale: string): Promise<Article[]> {
    const fileNames = await listFileNames(locale)
    const articles = await Promise.all(
      fileNames.map(async (fileName) => {
        const slug = getArticleSlugFromFileName(fileName)
        const rawArticle = await fetchArticleFile(locale, fileName)

        if (rawArticle === null) {
          throw new RemoteArticleSourceError({
            code: "MISSING_INDEXED_ARTICLE",
            message: `Remote index references a missing article: "${locale}/${fileName}".`,
          })
        }

        return parseRemoteArticle({ rawArticle, locale, slug })
      })
    )

    return articles.filter((article): article is Article => article !== null)
  }

  async function get(locale: string, slug: string): Promise<Article | null> {
    validateArticleSlug(slug)

    for (const extension of articleExtensions) {
      const rawArticle = await fetchArticleFile(locale, `${slug}${extension}`)

      if (rawArticle !== null) {
        return parseRemoteArticle({ rawArticle, locale, slug })
      }
    }

    return null
  }

  return { list, get }
}
