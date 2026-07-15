import type { MetadataRoute } from "next"

import { getArticles } from "@/features/articles/server"
import {
  createArticleLanguageAlternates,
  createStaticLanguageAlternates,
  groupLocalizedArticles,
  type LocalizedArticle,
} from "@/i18n/alternates"
import { publishedLocales } from "@/i18n/locale"
import { createArticlePath, createLocalizedPath } from "@/i18n/paths"
import { absoluteUrl } from "@/lib/config/site"
import { getArticleLastModified } from "@/lib/dates"

type SitemapEntry = MetadataRoute.Sitemap[number]

type SitemapChangeFrequency = NonNullable<SitemapEntry["changeFrequency"]>

type StaticRoute = {
  path: string
  changeFrequency: SitemapChangeFrequency
  priority: number
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

  const articleGroups = groupLocalizedArticles(articleCollections.flat())

  for (const articles of articleGroups.values()) {
    if (articles.length === 0) {
      continue
    }

    const { languages: languageAlternates } =
      createArticleLanguageAlternates(articles)

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
