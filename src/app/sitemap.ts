import type { MetadataRoute } from "next"

import { routing } from "@/i18n/routing"
import { getArticles, type AppLocale } from "@/lib/mdx/get-article"
import type { ArticleSummary } from "@/lib/mdx/article-schema"
import { absoluteUrl } from "@/lib/site"

type SitemapChangeFrequency = NonNullable<
  MetadataRoute.Sitemap[number]["changeFrequency"]
>

type StaticRoute = {
  path: string
  changeFrequency: SitemapChangeFrequency
  priority: number
}

type LocalizedArticle = {
  locale: AppLocale
  article: ArticleSummary
}

const staticRoutes: StaticRoute[] = [
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

function createLocalizedPath(locale: string, path: string): string {
  return `/${locale}${path}`
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

function createArticlePath(locale: string, slug: string): string {
  return `/${locale}/articles/${slug}`
}

function getArticleLastModified(article: ArticleSummary): Date {
  const date = article.metadata.updatedAt ?? article.metadata.publishedAt

  return new Date(`${date}T00:00:00.000Z`)
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = []

  /*
   * Static localized pages.
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
   * Load every published article for every locale.
   *
   * getArticles() derives each slug from its filename.
   */
  const localizedArticleCollections = await Promise.all(
    routing.locales.map(async (locale) => {
      const typedLocale = locale as AppLocale

      const articles = await getArticles(typedLocale)

      return articles.map((article) => ({
        locale: typedLocale,
        article,
      }))
    })
  )

  const localizedArticles = localizedArticleCollections.flat()

  /*
   * Group translations by translationKey when provided.
   * Otherwise use the filename-derived slug.
   *
   * This supports translated files that may later use
   * different slugs.
   */
  const articleGroups = new Map<string, LocalizedArticle[]>()

  for (const entry of localizedArticles) {
    const translationGroup =
      entry.article.metadata.translationKey ?? entry.article.slug

    const existingGroup = articleGroups.get(translationGroup) ?? []

    existingGroup.push(entry)

    articleGroups.set(translationGroup, existingGroup)
  }

  for (const articles of articleGroups.values()) {
    if (articles.length === 0) {
      continue
    }

    /*
     * Add only translations that actually exist.
     */
    const languageAlternates: Record<string, string> = Object.fromEntries(
      articles.map(({ locale, article }) => [
        locale,
        absoluteUrl(createArticlePath(locale, article.slug)),
      ])
    )

    const defaultArticle =
      articles.find(({ locale }) => locale === routing.defaultLocale) ??
      articles[0]

    languageAlternates["x-default"] = absoluteUrl(
      createArticlePath(defaultArticle.locale, defaultArticle.article.slug)
    )

    for (const { locale, article } of articles) {
      sitemapEntries.push({
        url: absoluteUrl(createArticlePath(locale, article.slug)),

        lastModified: getArticleLastModified(article),

        changeFrequency: "monthly",

        priority: article.metadata.featured ? 0.9 : 0.8,

        alternates: {
          languages: languageAlternates,
        },
      })
    }
  }

  return sitemapEntries
}
