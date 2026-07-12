import type { MetadataRoute } from "next"

import { routing } from "@/i18n/routing"
import type { ArticleSummary } from "@/lib/mdx/article-schema"
import { getArticles, type AppLocale } from "@/lib/mdx/get-article"
import { absoluteUrl } from "@/lib/site"

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

/**
 * Recreate the sitemap periodically when articles can come
 * from a remote or hybrid content source.
 *
 * For completely local MDX content, this is harmless because
 * deployments also regenerate the sitemap.
 */
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

function isAppLocale(locale: string): locale is AppLocale {
  return routing.locales.includes(locale as (typeof routing.locales)[number])
}

function createLocalizedPath(locale: string, path: string): string {
  return `/${locale}${path}`
}

function createArticlePath(locale: string, slug: string): string {
  return `/${locale}/articles/${slug}`
}

function createStaticLanguageAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((locale) => [
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

  /*
   * Add all static pages for every supported locale.
   */
  for (const route of staticRoutes) {
    const languageAlternates = createStaticLanguageAlternates(route.path)

    for (const locale of routing.locales) {
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

  /*
   * Load published articles for every supported locale.
   */
  const articleCollections = await Promise.all(
    routing.locales.map(async (locale) => {
      if (!isAppLocale(locale)) {
        return []
      }

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

  /*
   * Group translations together.
   *
   * translationKey allows translated articles to have
   * different slugs while remaining hreflang alternatives.
   *
   * When translationKey is absent, the filename-derived slug
   * becomes the translation group identifier.
   */
  const articleGroups = new Map<string, LocalizedArticle[]>()

  for (const localizedArticle of localizedArticles) {
    const groupKey = getArticleGroupKey(localizedArticle.article)

    const group = articleGroups.get(groupKey) ?? []

    group.push(localizedArticle)
    articleGroups.set(groupKey, group)
  }

  /*
   * Add each localized article and only the translations
   * that actually exist.
   */
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
