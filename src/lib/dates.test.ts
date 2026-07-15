import { describe, expect, it } from "vitest"

import {
  getArticleDateValue,
  getArticleLastModified,
  toIsoDate,
} from "@/lib/dates"
import type { ArticleSummary } from "@/lib/mdx/article-schema"

function createArticle(
  publishedAt: string,
  updatedAt?: string
): ArticleSummary {
  return {
    slug: "test-article",
    locale: "en",
    source: "local",
    metadata: {
      title: "Test article",
      description: "Test description",
      category: "Engineering",
      status: "Case Study",
      publishedAt,
      ...(updatedAt ? { updatedAt } : {}),
      coverImage: "/articles/test/cover.png",
      coverImageAlt: "Test cover",
      tags: [],
      stack: [],
      icon: "code",
      featured: false,
      draft: false,
    },
  }
}

describe("toIsoDate", () => {
  it("converts a valid date-only value to UTC ISO format", () => {
    expect(toIsoDate("2026-07-15")).toBe("2026-07-15T00:00:00.000Z")
  })

  it("accepts a valid leap day", () => {
    expect(toIsoDate("2024-02-29")).toBe("2024-02-29T00:00:00.000Z")
  })

  it.each([
    "",
    "not-a-date",
    "2026-02-29",
    "2026-04-31",
    "2026-13-01",
    "2026-00-01",
    "2026-7-15",
    "2026-07-15T10:00:00Z",
  ])("returns undefined for invalid value %s", (value) => {
    expect(toIsoDate(value)).toBeUndefined()
  })
})

describe("article dates", () => {
  it("prefers updatedAt for the article date value", () => {
    expect(getArticleDateValue(createArticle("2026-07-01", "2026-07-15"))).toBe(
      "2026-07-15"
    )
  })

  it("falls back to publishedAt", () => {
    expect(getArticleDateValue(createArticle("2026-07-01"))).toBe("2026-07-01")
  })

  it("returns a valid last-modified Date", () => {
    expect(
      getArticleLastModified(
        createArticle("2026-07-01", "2026-07-15")
      )?.toISOString()
    ).toBe("2026-07-15T00:00:00.000Z")
  })

  it("does not produce an invalid Date", () => {
    expect(
      getArticleLastModified(createArticle("invalid-date"))
    ).toBeUndefined()
  })
})
