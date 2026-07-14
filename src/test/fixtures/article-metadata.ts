import type { ArticleMetadata } from "@/lib/mdx/article-schema"

export const validArticleMetadata: ArticleMetadata = {
  title: "Building a Reliable Test Platform",
  description:
    "A test article used to verify article metadata validation behavior.",
  challenge:
    "Protect article metadata behavior while the content system evolves.",
  category: "Software Engineering",
  status: "Case Study",
  publishedAt: "2026-01-15",
  updatedAt: "2026-01-20",
  coverImage: "/articles/test-platform/cover.png",
  coverImageAlt: "Abstract software testing architecture",
  tags: ["Testing", "TypeScript"],
  stack: ["TypeScript", "Vitest"],
  icon: "code",
  featured: false,
  order: 10,
  draft: false,
  translationKey: "test-platform",
}

export function buildArticleMetadata(
  overrides: Partial<ArticleMetadata> = {}
): ArticleMetadata {
  return {
    ...validArticleMetadata,
    tags: [...validArticleMetadata.tags],
    stack: [...validArticleMetadata.stack],
    ...overrides,
  }
}
