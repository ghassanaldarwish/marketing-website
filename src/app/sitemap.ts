import type { MetadataRoute } from "next"

import { routing } from "@/i18n/routing"
import { getArticle, type AppLocale } from "@/lib/mdx/get-article"
import { absoluteUrl } from "@/lib/site"

/**
 * Keep this list in a central article index.
 *
 * Later, when the remote source has an index.json endpoint,
 * load the slugs from that endpoint instead.
 */
const articleSlugs = ["ai-agent-platform"] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = []

  const staticRoutes = ["", "/about", "/articles"] as const

  for (const locale of routing.locales) {
    for (const route of staticRoutes) {
      sitemapEntries.push({
        url: absoluteUrl(`/${locale}${route}`),
        lastModified: new Date(),
        changeFrequency: route === "" ? "weekly" : "monthly",
        priority: route === "" ? 1 : route === "/articles" ? 0.9 : 0.8,
      })
    }
  }

  for (const slug of articleSlugs) {
    for (const locale of routing.locales) {
      const article = await getArticle(locale as AppLocale, slug)

      if (!article) {
        continue
      }

      sitemapEntries.push({
        url: absoluteUrl(`/${locale}/articles/${slug}`),

        lastModified: new Date(
          `${article.metadata.updatedAt ?? article.metadata.publishedAt}T00:00:00.000Z`
        ),

        changeFrequency: "monthly",
        priority: 0.8,
      })
    }
  }

  return sitemapEntries
}
