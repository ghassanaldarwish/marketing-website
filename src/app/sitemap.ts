import type { MetadataRoute } from "next"

import { publishedLocales, type AppLocale } from "@/i18n/locale"
import { createArticlePath, createLocalizedPath } from "@/i18n/paths"
import { routing } from "@/i18n/routing"
import { absoluteUrl } from "@/lib/config/site"
import type { ArticleSummary } from "@/lib/mdx/article-schema"
import { getArticles } from "@/lib/mdx/get-article"

type SitemapEntry = MetadataRoute.Sitemap[number]

type SitemapChangeFrequency = NonNullable<SitemapEntry["changeFrequency"]>

type StaticRoute = {
  path: string
  changeFrequency: SitemapChangeFrequency
  priority: number
}

type LocalizedArticle = {
  locale: AppLocale
  article: ArticleSummary
}

export const revalidate = 3600

const staticRoutes: readonly StaticRoute[] = [
  {
    path: "",
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    path: "/about",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/articles",
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    path: "/contact",
    changeFrequency: "yearly",
    priority: 0.6,
  },
]

function createStaticLanguageAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = Object.fromEntries(
    publishedLocales.map((locale) => [
      locale,
      absoluteUrl(createLocalizedPath(locale, path)),
    ])
  )

  languages["x-default"] = absoluteUrl(
    createLocalizedPath(routing.defaultLocale, path)
  )

  return languages
}

function getArticleLastModified(article: ArticleSummary): Date | undefined {
  const value = article.metadata.updatedAt ?? article.metadata.publishedAt

  const date = new Date(`${value}T00:00:00.000Z`)

  return Number.isNaN(date.getTime()) ? undefined : date
}

function getArticleGroupKey(article: ArticleSummary): string {
  return article.metadata.translationKey ?? article.slug
}

function createArticleLanguageAlternates(
  articles: LocalizedArticle[]
): Record<string, string> {
  const languages: Record<string, string> = {}

  for (const { locale, article } of articles) {
    languages[locale] = absoluteUrl(createArticlePath(locale, article.slug))
  }

  const defaultArticle =
    articles.find(({ locale }) => locale === routing.defaultLocale) ??
    articles[0]

  if (defaultArticle) {
    languages["x-default"] = absoluteUrl(
      createArticlePath(defaultArticle.locale, defaultArticle.article.slug)
    )
  }

  return languages
}

function removeDuplicateEntries(
  entries: MetadataRoute.Sitemap
): MetadataRoute.Sitemap {
  const entriesByUrl = new Map<string, SitemapEntry>()

  for (const entry of entries) {
    entriesByUrl.set(entry.url, entry)
  }

  return Array.from(entriesByUrl.values())
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = []

  for (const route of staticRoutes) {
    const languageAlternates = createStaticLanguageAlternates(route.path)

    for (const locale of publishedLocales) {
      sitemapEntries.push({
        url: absoluteUrl(createLocalizedPath(locale, route.path)),

        changeFrequency: route.changeFrequency,
        priority: route.priority,

        alternates: {
          languages: languageAlternates,
        },
      })
    }
  }

  const articleCollections = await Promise.all(
    publishedLocales.map(async (locale) => {
      const articles = await getArticles(locale)

      return articles.map((article): LocalizedArticle => ({
        locale,
        article,
      }))
    })
  )

  const localizedArticles = articleCollections.flat().sort((a, b) => {
    const groupComparison = getArticleGroupKey(a.article).localeCompare(
      getArticleGroupKey(b.article)
    )

    if (groupComparison !== 0) {
      return groupComparison
    }

    return a.locale.localeCompare(b.locale)
  })

  const articleGroups = new Map<string, LocalizedArticle[]>()

  for (const localizedArticle of localizedArticles) {
    const groupKey = getArticleGroupKey(localizedArticle.article)
    const group = articleGroups.get(groupKey) ?? []

    group.push(localizedArticle)
    articleGroups.set(groupKey, group)
  }

  for (const articles of articleGroups.values()) {
    if (articles.length === 0) {
      continue
    }

    const languageAlternates = createArticleLanguageAlternates(articles)

    for (const { locale, article } of articles) {
      const entry: SitemapEntry = {
        url: absoluteUrl(createArticlePath(locale, article.slug)),

        changeFrequency: "monthly",

        priority: article.metadata.featured ? 0.9 : 0.8,

        alternates: {
          languages: languageAlternates,
        },
      }

      const lastModified = getArticleLastModified(article)

      if (lastModified) {
        entry.lastModified = lastModified
      }

      sitemapEntries.push(entry)
    }
  }

  return removeDuplicateEntries(sitemapEntries).sort((a, b) =>
    a.url.localeCompare(b.url)
  )
}
