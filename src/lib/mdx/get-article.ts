import "server-only"

import { readFile } from "node:fs/promises"
import path from "node:path"
import { cache } from "react"
import matter from "gray-matter"
import { z } from "zod"

import { routing } from "@/i18n/routing"
import { articleMetadataSchema, type Article } from "@/lib/mdx/article-schema"

export type AppLocale = (typeof routing.locales)[number]

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * Convert empty environment variables to undefined.
 *
 * For example:
 * MDX_REMOTE_BASE_URL=""
 */
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

function validateSlug(slug: string): void {
  if (!slugPattern.test(slug)) {
    throw new Error(`Invalid article slug: "${slug}"`)
  }
}

function getLocalArticlePath(locale: AppLocale, slug: string): string {
  return path.join(process.cwd(), "content", "articles", locale, `${slug}.mdx`)
}

async function readLocalArticle(
  locale: AppLocale,
  slug: string
): Promise<string | null> {
  const filePath = getLocalArticlePath(locale, slug)

  try {
    return await readFile(filePath, "utf8")
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException

    if (nodeError.code === "ENOENT") {
      return null
    }

    throw new Error(
      `Could not read local article "${locale}/${slug}": ${
        nodeError.message || "Unknown filesystem error"
      }`
    )
  }
}

function createRemoteArticleUrl(
  remoteBaseUrl: string,
  locale: AppLocale,
  slug: string
): URL {
  const normalizedBaseUrl = remoteBaseUrl.endsWith("/")
    ? remoteBaseUrl
    : `${remoteBaseUrl}/`

  return new URL(`${locale}/${slug}.mdx`, normalizedBaseUrl)
}

async function readRemoteArticle(
  remoteBaseUrl: string,
  locale: AppLocale,
  slug: string
): Promise<string | null> {
  const articleUrl = createRemoteArticleUrl(remoteBaseUrl, locale, slug)

  const response = await fetch(articleUrl, {
    headers: {
      Accept: "text/markdown, text/plain;q=0.9, */*;q=0.8",

      ...(mdxEnvironment.MDX_REMOTE_TOKEN
        ? {
            Authorization: `Bearer ${mdxEnvironment.MDX_REMOTE_TOKEN}`,
          }
        : {}),
    },

    next: {
      revalidate: mdxEnvironment.MDX_REVALIDATE_SECONDS,
      tags: [`article:${locale}:${slug}`],
    },
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(
      `Could not load remote article "${locale}/${slug}": ` +
        `${response.status} ${response.statusText}`
    )
  }

  return response.text()
}

async function getRawArticle(
  locale: AppLocale,
  slug: string
): Promise<string | null> {
  const {
    MDX_CONTENT_SOURCE: contentSource,
    MDX_REMOTE_BASE_URL: remoteBaseUrl,
  } = mdxEnvironment

  switch (contentSource) {
    case "local": {
      return readLocalArticle(locale, slug)
    }

    case "remote": {
      if (!remoteBaseUrl) {
        throw new Error(
          "MDX_REMOTE_BASE_URL is required when " +
            'MDX_CONTENT_SOURCE is set to "remote".'
        )
      }

      return readRemoteArticle(remoteBaseUrl, locale, slug)
    }

    case "hybrid": {
      /**
       * If no remote source is configured, hybrid mode behaves
       * like local mode.
       */
      if (!remoteBaseUrl) {
        return readLocalArticle(locale, slug)
      }

      /**
       * Remote content has priority.
       * A remote 404 falls back to the local file.
       *
       * Other remote errors are intentionally not ignored because
       * authentication and server errors should remain visible.
       */
      const remoteArticle = await readRemoteArticle(remoteBaseUrl, locale, slug)

      if (remoteArticle !== null) {
        return remoteArticle
      }

      return readLocalArticle(locale, slug)
    }
  }
}

async function loadArticle(
  locale: AppLocale,
  slug: string
): Promise<Article | null> {
  validateSlug(slug)

  const rawArticle = await getRawArticle(locale, slug)

  if (!rawArticle) {
    return null
  }

  const { data, content } = matter(rawArticle)

  const metadataResult = articleMetadataSchema.safeParse(data)

  if (!metadataResult.success) {
    throw new Error(
      `Invalid frontmatter in article "${locale}/${slug}":\n` +
        metadataResult.error.message
    )
  }

  const metadata = metadataResult.data

  if (metadata.draft && process.env.NODE_ENV === "production") {
    return null
  }

  return {
    metadata,
    body: content,
  }
}

/**
 * Deduplicates repeated calls during the same React Server
 * Component render, such as calls from generateMetadata()
 * and the article page.
 */
export const getArticle = cache(loadArticle)
