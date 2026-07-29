import { access } from "node:fs/promises"
import path from "node:path"

import { describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

import { createLocalArticleSource } from "@/features/articles/server/local-article-source"

const contentDirectory = path.join(process.cwd(), "content", "articles")
const publicDirectory = path.join(process.cwd(), "public")

const expectedPublishedSlugs = {
  en: ["ai-agent-platform"],
  de: ["ai-agent-platform"],
  ar: ["ai-agent-platform"],
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

  it("presents the AI agent platform as an illustrative reference architecture", async () => {
    const expectedByLocale = {
      en: {
        title:
          "Designing a Reliable AI Agent Platform: A Reference Architecture",
        status: "Reference Architecture",
        disclaimer: "This is a design reference",
        prohibited: [
          "This case study",
          "Before selecting technologies, I defined",
          "Why I separated",
        ],
      },
      de: {
        title: "AI-Agent-Plattform: Ein robuster Entwurf",
        status: "Referenzarchitektur",
        disclaimer: "Dies ist eine Designreferenz",
        prohibited: ["Diese Fallstudie", "definierte ich", "Warum ich"],
      },
      ar: {
        title: "تصميم منصة موثوقة لوكلاء الذكاء الاصطناعي: معمارية مرجعية",
        status: "معمارية مرجعية",
        disclaimer: "هذه معمارية مرجعية",
        prohibited: ["دراسة الحالة", "حددت أهداف", "لماذا فصلت"],
      },
    } as const

    for (const [locale, expected] of Object.entries(expectedByLocale)) {
      const article = (await source.list(locale)).find(
        ({ slug }) => slug === "ai-agent-platform"
      )

      expect(article).toBeDefined()
      expect(article?.metadata.title).toBe(expected.title)
      expect(article?.metadata.status).toBe(expected.status)
      expect(article?.metadata.updatedAt).toBe("2026-07-29")
      expect(article?.body).toContain(expected.disclaimer)

      for (const phrase of expected.prohibited) {
        expect(article?.body).not.toContain(phrase)
      }
    }
  })
})
