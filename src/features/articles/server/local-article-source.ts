import "server-only"

import { readdir, readFile } from "node:fs/promises"
import path from "node:path"

import type { Article } from "@/features/articles/domain/article"
import {
  articleFilePattern,
  getArticleSlugFromFileName,
  parseArticle,
  validateArticleSlug,
  type ArticleRuntimeMode,
} from "@/features/articles/domain/article-parser"
import type { ArticleRepository } from "@/features/articles/server/article-repository"

const articleExtensions = [".mdx", ".md"] as const

type LocalArticleSourceOptions = {
  contentDirectory: string
  getRuntimeMode?: () => ArticleRuntimeMode
}

export class LocalArticleSourceError extends Error {
  readonly code: NodeJS.ErrnoException["code"]

  constructor(message: string, cause: NodeJS.ErrnoException) {
    super(message, { cause })
    this.name = "LocalArticleSourceError"
    this.code = cause.code
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

function isFileSystemError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error
}

function isMissingPath(error: unknown): boolean {
  return isFileSystemError(error) && error.code === "ENOENT"
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

  return Array.from(fileNameBySlug.values()).sort((first, second) =>
    first.localeCompare(second)
  )
}

export function createLocalArticleSource({
  contentDirectory,
  getRuntimeMode = getDefaultRuntimeMode,
}: LocalArticleSourceOptions): ArticleRepository {
  function getLocaleDirectory(locale: string): string {
    return path.join(contentDirectory, locale)
  }

  async function listFileNames(locale: string): Promise<string[]> {
    try {
      const entries = await readdir(getLocaleDirectory(locale), {
        withFileTypes: true,
      })

      return preferArticleFileNames(
        entries
          .filter(
            (entry) => entry.isFile() && articleFilePattern.test(entry.name)
          )
          .map((entry) => entry.name)
      )
    } catch (error) {
      if (isMissingPath(error)) {
        return []
      }

      if (isFileSystemError(error)) {
        throw new LocalArticleSourceError(
          `Could not list local articles for "${locale}".`,
          error
        )
      }

      throw error
    }
  }

  async function readFileIfPresent(
    locale: string,
    fileName: string
  ): Promise<string | null> {
    try {
      return await readFile(
        path.join(getLocaleDirectory(locale), fileName),
        "utf8"
      )
    } catch (error) {
      if (isMissingPath(error)) {
        return null
      }

      if (isFileSystemError(error)) {
        throw new LocalArticleSourceError(
          `Could not read local article "${locale}/${fileName}".`,
          error
        )
      }

      throw error
    }
  }

  function parseLocalArticle({
    locale,
    slug,
    rawArticle,
  }: {
    locale: string
    slug: string
    rawArticle: string
  }): Article | null {
    try {
      return parseArticle({
        rawArticle,
        locale,
        slug,
        source: "local",
        runtimeMode: getRuntimeMode(),
      })
    } catch (error) {
      throw new Error(`Could not parse local article "${locale}/${slug}".`, {
        cause: error,
      })
    }
  }

  async function list(locale: string): Promise<Article[]> {
    const fileNames = await listFileNames(locale)
    const articles = await Promise.all(
      fileNames.map(async (fileName) => {
        const slug = getArticleSlugFromFileName(fileName)
        const rawArticle = await readFileIfPresent(locale, fileName)

        if (rawArticle === null) {
          throw new Error(
            `Local article disappeared while being listed: "${locale}/${fileName}".`
          )
        }

        return parseLocalArticle({ locale, slug, rawArticle })
      })
    )

    return articles.filter((article): article is Article => article !== null)
  }

  async function get(locale: string, slug: string): Promise<Article | null> {
    validateArticleSlug(slug)

    for (const extension of articleExtensions) {
      const rawArticle = await readFileIfPresent(locale, `${slug}${extension}`)

      if (rawArticle !== null) {
        return parseLocalArticle({ locale, slug, rawArticle })
      }
    }

    return null
  }

  return { list, get }
}
