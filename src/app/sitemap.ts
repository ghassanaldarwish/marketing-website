import type { MetadataRoute } from "next"

import { routing } from "@/i18n/routing"
import { getArticle, type AppLocale } from "@/lib/mdx/get-article"
import { absoluteUrl } from "@/lib/site"

/**
 * Move this into a central article registry later,
 * or load it from a remote index.json endpoint.
 */
const articleSlugs = ["ai-agent-platform"] as const

type StaticRoute = {
  path: string
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>
  priority: number
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
    path: "/engineering",
    changeFrequency: "weekly",
    priority: 0.9,
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = []

  /**
   * Static pages.
   *
   * Do not set lastModified unless you have a real date
   * representing the last meaningful content change.
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

  /**
   * Dynamic article pages.
   */
  for (const slug of articleSlugs) {
    const localizedArticles = await Promise.all(
      routing.locales.map(async (locale) => {
        const typedLocale = locale as AppLocale

        return {
          locale: typedLocale,
          article: await getArticle(typedLocale, slug),
        }
      })
    )

    const availableArticles = localizedArticles.filter(
      (
        entry
      ): entry is {
        locale: AppLocale
        article: NonNullable<Awaited<ReturnType<typeof getArticle>>>
      } => entry.article !== null
    )

    if (availableArticles.length === 0) {
      continue
    }

    /**
     * Only include translations that actually exist.
     */
    const articleAlternates: Record<string, string> = Object.fromEntries(
      availableArticles.map(({ locale }) => [
        locale,
        absoluteUrl(`/${locale}/articles/${slug}`),
      ])
    )

    const defaultArticle =
      availableArticles.find(
        ({ locale }) => locale === routing.defaultLocale
      ) ?? availableArticles[0]

    articleAlternates["x-default"] = absoluteUrl(
      `/${defaultArticle.locale}/articles/${slug}`
    )

    for (const { locale, article } of availableArticles) {
      const lastModified =
        article.metadata.updatedAt ?? article.metadata.publishedAt

      sitemapEntries.push({
        url: absoluteUrl(`/${locale}/articles/${slug}`),

        lastModified: new Date(`${lastModified}T00:00:00.000Z`),

        changeFrequency: "monthly",
        priority: 0.8,

        alternates: {
          languages: articleAlternates,
        },
      })
    }
  }

  return sitemapEntries
}
