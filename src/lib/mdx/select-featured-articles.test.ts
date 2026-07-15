import { describe, expect, it } from "vitest"

import type { ArticleSummary } from "@/lib/mdx/article-schema"
import { selectFeaturedArticles } from "@/lib/mdx/select-featured-articles"

function createArticle(
  slug: string,
  options: {
    featured?: boolean
    order?: number
    publishedAt?: string
  } = {}
): ArticleSummary {
  return {
    slug,
    locale: "en",
    source: "local",
    metadata: {
      title: slug,
      description: `${slug} description`,
      category: "Case Study",
      status: "Case Study",
      publishedAt: options.publishedAt ?? "2026-07-01",
      coverImage: `/articles/${slug}/cover.png`,
      coverImageAlt: `${slug} cover`,
      tags: [],
      stack: [],
      icon: "code",
      featured: options.featured ?? false,
      order: options.order,
      draft: false,
    },
  }
}

describe("selectFeaturedArticles", () => {
  it("selects articles explicitly featured or ordered for the Home page", () => {
    const featured = createArticle("featured", { featured: true })
    const ordered = createArticle("ordered", { order: 2 })
    const archiveOnly = createArticle("archive-only")

    expect(
      selectFeaturedArticles([featured, ordered, archiveOnly]).map(
        ({ slug }) => slug
      )
    ).toEqual(["featured", "ordered"])
  })

  it("sorts selected projects with the shared article policy", () => {
    const aiPlatform = createArticle("ai-platform", { order: 2 })
    const backendPlatform = createArticle("backend-platform", {
      featured: true,
      order: 1,
    })

    expect(
      selectFeaturedArticles([aiPlatform, backendPlatform]).map(
        ({ slug }) => slug
      )
    ).toEqual(["backend-platform", "ai-platform"])
  })

  it("does not mutate the loader result", () => {
    const first = createArticle("first", { order: 1 })
    const second = createArticle("second", { order: 2 })
    const articles = [second, first]

    selectFeaturedArticles(articles)

    expect(articles).toEqual([second, first])
  })

  it("returns an empty collection when no article is selected", () => {
    expect(selectFeaturedArticles([createArticle("archive-only")])).toEqual([])
  })
})
