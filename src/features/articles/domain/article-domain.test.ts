import { describe, expect, it } from "vitest"

import type { Article, ArticleSource } from "@/features/articles/domain/article"
import {
  ArticleDomainError,
  getArticleSlugFromFileName,
  parseArticle,
  validateArticleSlug,
} from "@/features/articles/domain/article-parser"
import {
  mergeArticles,
  sortArticles,
} from "@/features/articles/domain/article-policy"

function rawArticle({
  title = "Example",
  publishedAt = "2026-07-12",
  draft = false,
  featured = false,
  order,
}: {
  title?: string
  publishedAt?: string
  draft?: boolean
  featured?: boolean
  order?: number
} = {}): string {
  const orderLine = order === undefined ? "" : `order: ${order}\n`

  return `---
title: "${title}"
description: "Example description"
category: "Engineering"
publishedAt: "${publishedAt}"
coverImage: "/articles/example/cover.png"
coverImageAlt: "Example cover"
featured: ${featured}
${orderLine}draft: ${draft}
---

Article body.
`
}

function article({
  slug,
  title,
  publishedAt = "2026-07-12",
  featured = false,
  order,
  source = "local",
}: {
  slug: string
  title: string
  publishedAt?: string
  featured?: boolean
  order?: number
  source?: ArticleSource
}): Article {
  const result = parseArticle({
    rawArticle: rawArticle({ title, publishedAt, featured, order }),
    locale: "en",
    slug,
    source,
    runtimeMode: "test",
  })

  if (!result) {
    throw new Error("Fixture was unexpectedly filtered")
  }

  return result
}

describe("article parser", () => {
  it("parses valid frontmatter with defaults", () => {
    const result = parseArticle({
      rawArticle: rawArticle(),
      locale: "en",
      slug: "example",
      source: "local",
      runtimeMode: "development",
    })

    expect(result).toMatchObject({
      slug: "example",
      locale: "en",
      source: "local",
      metadata: {
        status: "Case Study",
        tags: [],
        stack: [],
        icon: "code",
        featured: false,
        draft: false,
      },
    })
  })

  it("throws a typed error for invalid frontmatter", () => {
    expect(() =>
      parseArticle({
        rawArticle: "---\ntitle: ''\n---\n",
        locale: "en",
        slug: "invalid",
        source: "local",
        runtimeMode: "test",
      })
    ).toThrowError(ArticleDomainError)
  })

  it.each(["", "Uppercase", "has spaces", "has_underscore", "double--dash"])(
    "rejects invalid slug %j",
    (slug) => {
      expect(() => validateArticleSlug(slug)).toThrow(
        `Invalid article slug: "${slug}"`
      )
    }
  )

  it.each([
    ["article.md", "article"],
    ["article.mdx", "article"],
    ["production-ai-platform.mdx", "production-ai-platform"],
  ])("extracts a slug from %s", (fileName, expected) => {
    expect(getArticleSlugFromFileName(fileName)).toBe(expected)
  })

  it.each(["Article.mdx", "article.txt", "article", "../article.mdx"])(
    "rejects invalid filename %j",
    (fileName) => {
      expect(() => getArticleSlugFromFileName(fileName)).toThrow(
        `Invalid article filename: "${fileName}"`
      )
    }
  )

  it("keeps drafts outside production", () => {
    const result = parseArticle({
      rawArticle: rawArticle({ draft: true }),
      locale: "en",
      slug: "draft",
      source: "local",
      runtimeMode: "development",
    })

    expect(result?.metadata.draft).toBe(true)
  })

  it("filters drafts in production", () => {
    const result = parseArticle({
      rawArticle: rawArticle({ draft: true }),
      locale: "en",
      slug: "draft",
      source: "local",
      runtimeMode: "production",
    })

    expect(result).toBeNull()
  })
})

describe("article policy", () => {
  it("preserves featured, order, date, and title ordering", () => {
    const items = [
      article({ slug: "zulu", title: "Zulu", publishedAt: "2026-01-01" }),
      article({ slug: "alpha", title: "Alpha", publishedAt: "2026-01-01" }),
      article({ slug: "ordered", title: "Ordered", order: 1 }),
      article({ slug: "featured", title: "Featured", featured: true }),
    ]

    expect(sortArticles(items).map(({ slug }) => slug)).toEqual([
      "featured",
      "ordered",
      "alpha",
      "zulu",
    ])
  })

  it("does not mutate the input array", () => {
    const second = article({ slug: "second", title: "Second", order: 2 })
    const first = article({ slug: "first", title: "First", order: 1 })
    const input = [second, first]

    sortArticles(input)

    expect(input.map(({ slug }) => slug)).toEqual(["second", "first"])
  })

  it("lets remote articles override local duplicate slugs", () => {
    const local = article({
      slug: "shared",
      title: "Local",
      source: "local",
    })
    const remote = article({
      slug: "shared",
      title: "Remote",
      source: "remote",
    })

    const result = mergeArticles({
      localArticles: [local],
      remoteArticles: [remote],
    })

    expect(result).toEqual([remote])
  })
})
