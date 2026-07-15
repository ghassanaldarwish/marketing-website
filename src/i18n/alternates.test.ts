import { describe, expect, it, vi } from "vitest"

import {
  createArticleLanguageAlternates,
  createStaticLanguageAlternates,
  getArticleLanguageAlternates,
  groupLocalizedArticles,
  type LocalizedArticle,
} from "@/i18n/alternates"
import type { ArticleSummary } from "@/lib/mdx/article-schema"

function createArticle(
  locale: string,
  slug: string,
  translationKey?: string
): ArticleSummary {
  return {
    slug,
    locale,
    source: "local",
    metadata: {
      title: slug,
      description: `${slug} description`,
      category: "Engineering",
      status: "Case Study",
      publishedAt: "2026-07-01",
      coverImage: `/articles/${slug}/cover.png`,
      coverImageAlt: `${slug} cover`,
      tags: [],
      stack: [],
      icon: "code",
      featured: false,
      draft: false,
      ...(translationKey ? { translationKey } : {}),
    },
  }
}

describe("createStaticLanguageAlternates", () => {
  it("creates locales in configured order and a deterministic x-default", () => {
    const result = createStaticLanguageAlternates("/about")

    expect(Object.keys(result)).toEqual(["en", "de", "ar", "x-default"])
    expect(result).toEqual({
      en: "https://ghassan.de/en/about",
      de: "https://ghassan.de/de/about",
      ar: "https://ghassan.de/ar/about",
      "x-default": "https://ghassan.de/en/about",
    })
  })

  it("creates home-route alternates without a trailing slash", () => {
    expect(createStaticLanguageAlternates()).toEqual({
      en: "https://ghassan.de/en",
      de: "https://ghassan.de/de",
      ar: "https://ghassan.de/ar",
      "x-default": "https://ghassan.de/en",
    })
  })
})

describe("createArticleLanguageAlternates", () => {
  it("includes only translations that exist", () => {
    const articles: LocalizedArticle[] = [
      {
        locale: "en",
        article: createArticle("en", "platform"),
      },
      {
        locale: "de",
        article: createArticle("de", "plattform"),
      },
    ]

    expect(createArticleLanguageAlternates(articles)).toEqual({
      languages: {
        en: "https://ghassan.de/en/articles/platform",
        de: "https://ghassan.de/de/articles/plattform",
        "x-default": "https://ghassan.de/en/articles/platform",
      },
      availableLocales: ["en", "de"],
    })
  })

  it("uses the first configured available locale when English is missing", () => {
    const articles: LocalizedArticle[] = [
      {
        locale: "ar",
        article: createArticle("ar", "agent-ar"),
      },
      {
        locale: "de",
        article: createArticle("de", "plattform"),
      },
    ]

    const result = createArticleLanguageAlternates(articles)

    expect(Object.keys(result.languages)).toEqual(["de", "ar", "x-default"])
    expect(result.languages["x-default"]).toBe(
      "https://ghassan.de/de/articles/plattform"
    )
    expect(result.availableLocales).toEqual(["de", "ar"])
  })
})

describe("groupLocalizedArticles", () => {
  it("groups translated articles by translation key and locale order", () => {
    const articles: LocalizedArticle[] = [
      {
        locale: "de",
        article: createArticle("de", "plattform", "platform"),
      },
      {
        locale: "en",
        article: createArticle("en", "platform", "platform"),
      },
      {
        locale: "ar",
        article: createArticle("ar", "agent"),
      },
    ]

    const groups = groupLocalizedArticles(articles)

    expect([...groups.keys()]).toEqual(["agent", "platform"])
    expect(groups.get("platform")?.map(({ locale }) => locale)).toEqual([
      "en",
      "de",
    ])
  })
})

describe("getArticleLanguageAlternates", () => {
  it("does not advertise missing article translations", async () => {
    const getArticle = vi.fn(async (locale: string) =>
      locale === "ar" ? null : { locale }
    )

    const result = await getArticleLanguageAlternates("platform", getArticle)

    expect(result).toEqual({
      languages: {
        en: "https://ghassan.de/en/articles/platform",
        de: "https://ghassan.de/de/articles/platform",
        "x-default": "https://ghassan.de/en/articles/platform",
      },
      availableLocales: ["en", "de"],
    })

    expect(getArticle).toHaveBeenCalledTimes(3)
  })
})
