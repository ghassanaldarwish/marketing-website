import { defaultLocale, publishedLocales, type AppLocale } from "@/i18n/locale"
import { createArticlePath, createLocalizedPath } from "@/i18n/paths"
import { absoluteUrl } from "@/lib/config/site"
import type { ArticleSummary } from "@/lib/mdx/article-schema"

export type LocalizedArticle = {
  locale: AppLocale
  article: ArticleSummary
}

export type ArticleLanguageAlternates = {
  languages: Record<string, string>
  availableLocales: AppLocale[]
}

type ArticleLookup<TArticle> = (
  locale: AppLocale,
  slug: string
) => Promise<TArticle | null>

function addDefaultAlternate(
  languages: Record<string, string>,
  availableLocales: readonly AppLocale[]
): void {
  const defaultUrl =
    languages[defaultLocale] ??
    availableLocales
      .map((locale) => languages[locale])
      .find((url): url is string => typeof url === "string")

  if (defaultUrl) {
    languages["x-default"] = defaultUrl
  }
}

export function createStaticLanguageAlternates(
  path: string = ""
): Record<string, string> {
  const languages: Record<string, string> = {}

  for (const locale of publishedLocales) {
    languages[locale] = absoluteUrl(createLocalizedPath(locale, path))
  }

  languages["x-default"] = absoluteUrl(createLocalizedPath(defaultLocale, path))

  return languages
}

function getArticleGroupKey(article: ArticleSummary): string {
  return article.metadata.translationKey ?? article.slug
}

export function groupLocalizedArticles(
  localizedArticles: readonly LocalizedArticle[]
): Map<string, LocalizedArticle[]> {
  const sortedArticles = [...localizedArticles].sort((a, b) => {
    const groupComparison = getArticleGroupKey(a.article).localeCompare(
      getArticleGroupKey(b.article)
    )

    if (groupComparison !== 0) {
      return groupComparison
    }

    return (
      publishedLocales.indexOf(a.locale) - publishedLocales.indexOf(b.locale)
    )
  })

  const groups = new Map<string, LocalizedArticle[]>()

  for (const localizedArticle of sortedArticles) {
    const groupKey = getArticleGroupKey(localizedArticle.article)
    const group = groups.get(groupKey) ?? []

    group.push(localizedArticle)
    groups.set(groupKey, group)
  }

  return groups
}

export function createArticleLanguageAlternates(
  localizedArticles: readonly LocalizedArticle[]
): ArticleLanguageAlternates {
  const articlesByLocale = new Map<AppLocale, LocalizedArticle>()

  for (const localizedArticle of localizedArticles) {
    if (!articlesByLocale.has(localizedArticle.locale)) {
      articlesByLocale.set(localizedArticle.locale, localizedArticle)
    }
  }

  const languages: Record<string, string> = {}
  const availableLocales: AppLocale[] = []

  for (const locale of publishedLocales) {
    const localizedArticle = articlesByLocale.get(locale)

    if (!localizedArticle) {
      continue
    }

    languages[locale] = absoluteUrl(
      createArticlePath(locale, localizedArticle.article.slug)
    )
    availableLocales.push(locale)
  }

  addDefaultAlternate(languages, availableLocales)

  return {
    languages,
    availableLocales,
  }
}

export async function getArticleLanguageAlternates<TArticle>(
  slug: string,
  getArticle: ArticleLookup<TArticle>
): Promise<ArticleLanguageAlternates> {
  const localizedArticles = await Promise.all(
    publishedLocales.map(async (locale) => ({
      locale,
      article: await getArticle(locale, slug),
    }))
  )

  const languages: Record<string, string> = {}
  const availableLocales: AppLocale[] = []

  for (const localizedArticle of localizedArticles) {
    if (!localizedArticle.article) {
      continue
    }

    languages[localizedArticle.locale] = absoluteUrl(
      createArticlePath(localizedArticle.locale, slug)
    )
    availableLocales.push(localizedArticle.locale)
  }

  addDefaultAlternate(languages, availableLocales)

  return {
    languages,
    availableLocales,
  }
}
