import { access, readFile, readdir, stat } from "node:fs/promises"
import path from "node:path"
import { pathToFileURL } from "node:url"

import {
  articleFilePattern,
  getArticleSlugFromFileName,
  parseArticle,
  parseRemoteArticleIndex,
} from "../src/features/articles/domain/article-parser"
import { publishedLocales } from "../src/i18n/locale"

const requiredDictionaryNamespaces = [
  "brand",
  "contactModal",
  "navbar",
  "footer",
  "notFound",
  "metadata",
  "home",
  "about",
  "articles",
  "contact",
] as const

const prohibitedPlaceholderPatterns = [
  /\b(?:TODO|FIXME|TBD)\b/i,
  /\blorem ipsum\b/i,
  /\[(?:placeholder|replace[ -]?me)\]/i,
] as const

type JsonObject = Record<string, unknown>

export type ContentValidationIssue = {
  locale: string
  slug: string
  filePath: string
  message: string
}

export type ContentCheckOutput = {
  log(message: string): void
  error(message: string): void
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function relativePath(rootDirectory: string, filePath: string): string {
  return path.relative(rootDirectory, filePath).split(path.sep).join("/")
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function addIssue(
  issues: ContentValidationIssue[],
  issue: ContentValidationIssue
): void {
  issues.push(issue)
}

async function parseJsonFile({
  rootDirectory,
  filePath,
  locale,
  slug,
  issues,
}: {
  rootDirectory: string
  filePath: string
  locale: string
  slug: string
  issues: ContentValidationIssue[]
}): Promise<unknown | undefined> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as unknown
  } catch (error) {
    addIssue(issues, {
      locale,
      slug,
      filePath: relativePath(rootDirectory, filePath),
      message: `Invalid JSON: ${errorMessage(error)}`,
    })
    return undefined
  }
}

function scanForPlaceholders({
  value,
  propertyPath,
  context,
  issues,
}: {
  value: unknown
  propertyPath: string
  context: Omit<ContentValidationIssue, "message">
  issues: ContentValidationIssue[]
}): void {
  if (typeof value === "string") {
    const pattern = prohibitedPlaceholderPatterns.find((candidate) =>
      candidate.test(value)
    )

    if (pattern) {
      addIssue(issues, {
        ...context,
        message: `Prohibited placeholder at "${propertyPath || "content"}": ${pattern.source}`,
      })
    }
    return
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      scanForPlaceholders({
        value: item,
        propertyPath: `${propertyPath}[${index}]`,
        context,
        issues,
      })
    )
    return
  }

  if (isJsonObject(value)) {
    for (const [key, child] of Object.entries(value)) {
      scanForPlaceholders({
        value: child,
        propertyPath: propertyPath ? `${propertyPath}.${key}` : key,
        context,
        issues,
      })
    }
  }
}

function validateDictionaryShape({
  reference,
  candidate,
  propertyPath,
  context,
  issues,
}: {
  reference: unknown
  candidate: unknown
  propertyPath: string
  context: Omit<ContentValidationIssue, "message">
  issues: ContentValidationIssue[]
}): void {
  if (Array.isArray(reference)) {
    if (!Array.isArray(candidate)) {
      addIssue(issues, {
        ...context,
        message: `Dictionary value "${propertyPath}" must be an array.`,
      })
      return
    }

    if (reference.length > 0) {
      for (const [index, item] of candidate.entries()) {
        validateDictionaryShape({
          reference: reference[0],
          candidate: item,
          propertyPath: `${propertyPath}[${index}]`,
          context,
          issues,
        })
      }
    }
    return
  }

  if (isJsonObject(reference)) {
    if (!isJsonObject(candidate)) {
      addIssue(issues, {
        ...context,
        message: `Dictionary value "${propertyPath}" must be an object.`,
      })
      return
    }

    for (const [key, childReference] of Object.entries(reference)) {
      const childPath = propertyPath ? `${propertyPath}.${key}` : key

      if (!(key in candidate)) {
        addIssue(issues, {
          ...context,
          message: `Missing required dictionary key "${childPath}".`,
        })
        continue
      }

      validateDictionaryShape({
        reference: childReference,
        candidate: candidate[key],
        propertyPath: childPath,
        context,
        issues,
      })
    }
    return
  }

  if (typeof candidate !== typeof reference) {
    addIssue(issues, {
      ...context,
      message: `Dictionary value "${propertyPath}" must be ${typeof reference}.`,
    })
  }
}

async function validateDictionaries({
  rootDirectory,
  issues,
}: {
  rootDirectory: string
  issues: ContentValidationIssue[]
}): Promise<void> {
  const dictionaryDirectory = path.join(
    rootDirectory,
    "content",
    "dictionaries"
  )
  const dictionaries = new Map<string, JsonObject>()

  for (const locale of publishedLocales) {
    const filePath = path.join(dictionaryDirectory, `${locale}.json`)
    const parsed = await parseJsonFile({
      rootDirectory,
      filePath,
      locale,
      slug: "dictionary",
      issues,
    })

    if (!isJsonObject(parsed)) {
      if (parsed !== undefined) {
        addIssue(issues, {
          locale,
          slug: "dictionary",
          filePath: relativePath(rootDirectory, filePath),
          message: "Locale dictionary must be a JSON object.",
        })
      }
      continue
    }

    dictionaries.set(locale, parsed)
  }

  const germanContactPath = path.join(dictionaryDirectory, "contact", "de.json")
  const germanContact = await parseJsonFile({
    rootDirectory,
    filePath: germanContactPath,
    locale: "de",
    slug: "contact-form",
    issues,
  })
  const germanDictionary = dictionaries.get("de")

  if (isJsonObject(germanDictionary) && isJsonObject(germanContact)) {
    const contact = germanDictionary.contact

    if (isJsonObject(contact)) {
      germanDictionary.contact = { ...contact, form: germanContact }
    }
  }

  const reference = dictionaries.get("en")

  if (!reference) {
    return
  }

  for (const locale of publishedLocales) {
    const dictionary = dictionaries.get(locale)
    const filePath = path.join(dictionaryDirectory, `${locale}.json`)
    const context = {
      locale,
      slug: "dictionary",
      filePath: relativePath(rootDirectory, filePath),
    }

    if (!dictionary) {
      continue
    }

    for (const namespace of requiredDictionaryNamespaces) {
      if (!(namespace in dictionary)) {
        addIssue(issues, {
          ...context,
          message: `Missing required dictionary namespace "${namespace}".`,
        })
      }
    }

    validateDictionaryShape({
      reference,
      candidate: dictionary,
      propertyPath: "",
      context,
      issues,
    })
    scanForPlaceholders({
      value: dictionary,
      propertyPath: "",
      context,
      issues,
    })
  }
}

async function validateCoverImage({
  rootDirectory,
  locale,
  slug,
  filePath,
  coverImage,
  issues,
}: {
  rootDirectory: string
  locale: string
  slug: string
  filePath: string
  coverImage: string
  issues: ContentValidationIssue[]
}): Promise<void> {
  const publicDirectory = path.resolve(rootDirectory, "public")
  const coverPath = path.resolve(publicDirectory, `.${coverImage}`)
  const context = {
    locale,
    slug,
    filePath: relativePath(rootDirectory, filePath),
  }

  if (
    !coverImage.startsWith("/") ||
    (coverPath !== publicDirectory &&
      !coverPath.startsWith(`${publicDirectory}${path.sep}`))
  ) {
    addIssue(issues, {
      ...context,
      message: `Cover image must be a root-relative path inside public: "${coverImage}".`,
    })
    return
  }

  try {
    const coverStats = await stat(coverPath)

    if (!coverStats.isFile()) {
      throw new Error("path is not a file")
    }
  } catch (error) {
    addIssue(issues, {
      ...context,
      message: `Missing cover image "${coverImage}": ${errorMessage(error)}`,
    })
  }
}

async function validateRemoteIndex({
  rootDirectory,
  locale,
  localeDirectory,
  issues,
}: {
  rootDirectory: string
  locale: string
  localeDirectory: string
  issues: ContentValidationIssue[]
}): Promise<void> {
  const indexPath = path.join(localeDirectory, "index.json")
  const parsed = await parseJsonFile({
    rootDirectory,
    filePath: indexPath,
    locale,
    slug: "remote-index",
    issues,
  })

  if (parsed === undefined) {
    return
  }

  let fileNames: string[]

  try {
    fileNames = parseRemoteArticleIndex(parsed)
  } catch (error) {
    addIssue(issues, {
      locale,
      slug: "remote-index",
      filePath: relativePath(rootDirectory, indexPath),
      message: `Malformed remote index fixture: ${errorMessage(error)}`,
    })
    return
  }

  const fileNameBySlug = new Map<string, string>()

  for (const fileName of fileNames) {
    const slug = getArticleSlugFromFileName(fileName)
    const existing = fileNameBySlug.get(slug)

    if (existing) {
      addIssue(issues, {
        locale,
        slug,
        filePath: relativePath(rootDirectory, indexPath),
        message: `Duplicate remote locale/slug identity in "${existing}" and "${fileName}".`,
      })
      continue
    }

    fileNameBySlug.set(slug, fileName)

    try {
      await access(path.join(localeDirectory, fileName))
    } catch {
      addIssue(issues, {
        locale,
        slug,
        filePath: relativePath(rootDirectory, indexPath),
        message: `Remote index fixture references missing file "${fileName}".`,
      })
    }
  }
}

async function validateArticles({
  rootDirectory,
  issues,
}: {
  rootDirectory: string
  issues: ContentValidationIssue[]
}): Promise<void> {
  const articleDirectory = path.join(rootDirectory, "content", "articles")

  for (const locale of publishedLocales) {
    const localeDirectory = path.join(articleDirectory, locale)
    let fileNames: string[]

    try {
      fileNames = (await readdir(localeDirectory)).sort()
    } catch (error) {
      addIssue(issues, {
        locale,
        slug: "articles",
        filePath: relativePath(rootDirectory, localeDirectory),
        message: `Could not read locale article directory: ${errorMessage(error)}`,
      })
      continue
    }

    const markdownFileNames = fileNames.filter((fileName) =>
      /\.(?:md|mdx)$/i.test(fileName)
    )
    const articleFileNames = markdownFileNames.filter((fileName) => {
      if (articleFilePattern.test(fileName)) {
        return true
      }

      addIssue(issues, {
        locale,
        slug: fileName,
        filePath: relativePath(
          rootDirectory,
          path.join(localeDirectory, fileName)
        ),
        message:
          "Invalid article filename; use lowercase kebab-case with .md or .mdx.",
      })
      return false
    })
    const fileNameBySlug = new Map<string, string>()

    for (const fileName of articleFileNames) {
      const slug = getArticleSlugFromFileName(fileName)
      const filePath = path.join(localeDirectory, fileName)
      const existing = fileNameBySlug.get(slug)
      const context = {
        locale,
        slug,
        filePath: relativePath(rootDirectory, filePath),
      }

      if (existing) {
        addIssue(issues, {
          ...context,
          message: `Duplicate local locale/slug identity in "${existing}" and "${fileName}".`,
        })
      } else {
        fileNameBySlug.set(slug, fileName)
      }

      let rawArticle: string

      try {
        rawArticle = await readFile(filePath, "utf8")
      } catch (error) {
        addIssue(issues, {
          ...context,
          message: `Could not read article: ${errorMessage(error)}`,
        })
        continue
      }

      scanForPlaceholders({
        value: rawArticle,
        propertyPath: "content",
        context,
        issues,
      })

      try {
        const article = parseArticle({
          rawArticle,
          locale,
          slug,
          source: "local",
          runtimeMode: "test",
        })

        if (!article) {
          throw new Error("Article parser unexpectedly returned no article.")
        }

        if (article.body.trimStart().match(/^---(?:\r?\n|$)/)) {
          addIssue(issues, {
            ...context,
            message:
              "Article body begins with an accidental frontmatter delimiter.",
          })
        }

        await validateCoverImage({
          rootDirectory,
          locale,
          slug,
          filePath,
          coverImage: article.metadata.coverImage,
          issues,
        })
      } catch (error) {
        addIssue(issues, {
          ...context,
          message: `Invalid article: ${errorMessage(error)}`,
        })
      }
    }

    await validateRemoteIndex({
      rootDirectory,
      locale,
      localeDirectory,
      issues,
    })
  }
}

export async function validateContent(
  rootDirectory = process.cwd()
): Promise<ContentValidationIssue[]> {
  const issues: ContentValidationIssue[] = []

  await validateDictionaries({ rootDirectory, issues })
  await validateArticles({ rootDirectory, issues })

  return issues.sort(
    (first, second) =>
      first.filePath.localeCompare(second.filePath) ||
      first.locale.localeCompare(second.locale) ||
      first.slug.localeCompare(second.slug) ||
      first.message.localeCompare(second.message)
  )
}

export async function runContentCheck({
  rootDirectory = process.cwd(),
  output = console,
}: {
  rootDirectory?: string
  output?: ContentCheckOutput
} = {}): Promise<number> {
  const issues = await validateContent(rootDirectory)

  if (issues.length === 0) {
    output.log(`Content validation passed for ${publishedLocales.join(", ")}.`)
    return 0
  }

  output.error(`Content validation failed with ${issues.length} issue(s):`)
  for (const issue of issues) {
    output.error(
      `[locale=${issue.locale} slug=${issue.slug} file=${issue.filePath}] ${issue.message}`
    )
  }

  return 1
}

const invokedPath = process.argv[1]

if (invokedPath && import.meta.url === pathToFileURL(invokedPath).href) {
  void runContentCheck()
    .then((exitCode) => {
      process.exitCode = exitCode
    })
    .catch((error: unknown) => {
      console.error(`Content validation could not run: ${errorMessage(error)}`)
      process.exitCode = 1
    })
}
