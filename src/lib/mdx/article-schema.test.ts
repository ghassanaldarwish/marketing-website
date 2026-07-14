import { describe, expect, it } from "vitest"

import { articleMetadataSchema } from "@/lib/mdx/article-schema"
import {
  buildArticleMetadata,
  validArticleMetadata,
} from "@/test/fixtures/article-metadata"

describe("articleMetadataSchema", () => {
  it("accepts complete valid article metadata", () => {
    expect(articleMetadataSchema.safeParse(validArticleMetadata).success).toBe(
      true
    )
  })

  it("applies intended defaults", () => {
    const result = articleMetadataSchema.parse({
      title: "Default metadata behavior",
      description: "An article without optional metadata values.",
      category: "Testing",
      publishedAt: "2026-01-15",
      coverImage: "/articles/defaults/cover.png",
      coverImageAlt: "Abstract default values illustration",
    })

    expect(result).toMatchObject({
      status: "Case Study",
      tags: [],
      stack: [],
      icon: "code",
      featured: false,
      draft: false,
    })
  })

  it("supports explicit draft and translation key values", () => {
    const result = articleMetadataSchema.parse(
      buildArticleMetadata({
        draft: true,
        translationKey: "production-ai-platform",
      })
    )

    expect(result.draft).toBe(true)
    expect(result.translationKey).toBe("production-ai-platform")
  })

  it.each(["2026/02/03", "03-02-2026", "2026-2-3", "2026-02-03T10:00:00Z"])(
    "rejects invalid publishedAt format %s",
    (publishedAt) => {
      const result = articleMetadataSchema.safeParse(
        buildArticleMetadata({ publishedAt })
      )

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ["publishedAt"],
              message: "publishedAt must use YYYY-MM-DD",
            }),
          ])
        )
      }
    }
  )

  it.each(["2026/02/03", "03-02-2026", "2026-2-3", "2026-02-03T10:00:00Z"])(
    "rejects invalid updatedAt format %s",
    (updatedAt) => {
      const result = articleMetadataSchema.safeParse(
        buildArticleMetadata({ updatedAt })
      )

      expect(result.success).toBe(false)
    }
  )

  it("accepts zero and positive integer order values", () => {
    expect(
      articleMetadataSchema.safeParse(buildArticleMetadata({ order: 0 }))
        .success
    ).toBe(true)
    expect(
      articleMetadataSchema.safeParse(buildArticleMetadata({ order: 25 }))
        .success
    ).toBe(true)
  })

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid order value %s",
    (order) => {
      expect(
        articleMetadataSchema.safeParse(buildArticleMetadata({ order }))
          .success
      ).toBe(false)
    }
  )

  it.each([
    ["title", ""],
    ["description", ""],
    ["category", ""],
    ["coverImage", ""],
    ["coverImageAlt", ""],
  ] as const)("rejects an empty required %s", (field, value) => {
    const result = articleMetadataSchema.safeParse({
      ...buildArticleMetadata(),
      [field]: value,
    })

    expect(result.success).toBe(false)
  })

  it("rejects unsupported icons and invalid collection entries", () => {
    expect(
      articleMetadataSchema.safeParse({
        ...buildArticleMetadata(),
        icon: "database",
      }).success
    ).toBe(false)
    expect(
      articleMetadataSchema.safeParse({
        ...buildArticleMetadata(),
        tags: ["Testing", 42],
      }).success
    ).toBe(false)
    expect(
      articleMetadataSchema.safeParse({
        ...buildArticleMetadata(),
        stack: ["TypeScript", false],
      }).success
    ).toBe(false)
  })

  it("rejects missing required frontmatter", () => {
    const result = articleMetadataSchema.safeParse({})

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toMatchObject({
        title: expect.any(Array),
        description: expect.any(Array),
        category: expect.any(Array),
        publishedAt: expect.any(Array),
        coverImage: expect.any(Array),
        coverImageAlt: expect.any(Array),
      })
    }
  })
})
