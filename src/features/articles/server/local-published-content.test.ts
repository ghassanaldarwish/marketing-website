import { access } from "node:fs/promises"
import path from "node:path"

import { describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

import { createLocalArticleSource } from "@/features/articles/server/local-article-source"

const contentDirectory = path.join(process.cwd(), "content", "articles")
const publicDirectory = path.join(process.cwd(), "public")

const expectedPublishedSlugs = {
  en: ["scalable-backend-platform"],
  de: ["ai-agent-platform", "scalable-backend-platform"],
  ar: ["ai-agent-platform", "scalable-backend-platform"],
} as const

describe("bundled published article content", () => {
  const source = createLocalArticleSource({
    contentDirectory,
    getRuntimeMode: () => "production",
  })

  it("does not render a frontmatter-like delimiter before article copy", async () => {
    for (const locale of Object.keys(expectedPublishedSlugs)) {
      const articles = await source.list(locale)

      for (const article of articles) {
        expect(article.body.trimStart()).not.toMatch(/^---(?:\r?\n|$)/)
      }
    }
  })

  it("keeps localized identity, publication metadata, and cover assets valid", async () => {
    for (const [locale, expectedSlugs] of Object.entries(
      expectedPublishedSlugs
    )) {
      const articles = await source.list(locale)

      expect(articles.map((article) => article.slug).sort()).toEqual(
        [...expectedSlugs].sort()
      )

      for (const article of articles) {
        expect(article.locale).toBe(locale)
        expect(article.metadata.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(article.metadata.coverImage).toMatch(
          /^\/articles\/.+\/cover\.png$/
        )
        expect(article.metadata.coverImageAlt).toBeTruthy()

        await expect(
          access(
            path.join(
              publicDirectory,
              article.metadata.coverImage?.replace(/^\/+/, "") ?? ""
            )
          )
        ).resolves.toBeUndefined()
      }
    }
  })

  it("keeps the English AI Agent draft out of production", async () => {
    await expect(source.get("en", "ai-agent-platform")).resolves.toBeNull()
  })
})
