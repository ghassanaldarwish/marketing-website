import { describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

import type { Article } from "@/features/articles/domain/article"
import type { ArticleRepository } from "@/features/articles/server/article-repository"
import {
  createArticleService,
  selectArticleSource,
} from "@/features/articles/server/article-service"
import { createHybridArticleSource } from "@/features/articles/server/hybrid-article-source"

function createArticle({
  slug,
  source,
  title = slug,
  order,
}: {
  slug: string
  source: Article["source"]
  title?: string
  order?: number
}): Article {
  return {
    slug,
    locale: "en",
    source,
    body: `# ${title}`,
    metadata: {
      title,
      description: `${title} description`,
      category: "Engineering",
      status: "Case Study",
      publishedAt: "2026-01-01",
      coverImage: `/images/${slug}.png`,
      coverImageAlt: `${title} cover`,
      tags: [],
      stack: [],
      icon: "code",
      featured: false,
      draft: false,
      ...(order === undefined ? {} : { order }),
    },
  }
}

function createRepository(articles: Article[] = []): ArticleRepository {
  return {
    list: vi.fn(async (locale: string) =>
      articles.filter((article) => article.locale === locale)
    ),
    get: vi.fn(
      async (locale: string, slug: string) =>
        articles.find(
          (article) => article.locale === locale && article.slug === slug
        ) ?? null
    ),
  }
}

describe("article service", () => {
  it("selects local and remote repositories without mutating process.env", () => {
    const localSource = createRepository()
    const remoteSource = createRepository()

    expect(
      selectArticleSource(
        { contentSource: "local" },
        { localSource, remoteSource }
      )
    ).toBe(localSource)
    expect(
      selectArticleSource(
        { contentSource: "remote" },
        { localSource, remoteSource }
      )
    ).toBe(remoteSource)
  })

  it("requires remote configuration for remote and hybrid modes", () => {
    const localSource = createRepository()

    expect(() =>
      selectArticleSource({ contentSource: "remote" }, { localSource })
    ).toThrow(
      'MDX_REMOTE_BASE_URL is required when MDX_CONTENT_SOURCE is "remote".'
    )
    expect(() =>
      selectArticleSource({ contentSource: "hybrid" }, { localSource })
    ).toThrow(
      'MDX_REMOTE_BASE_URL is required when MDX_CONTENT_SOURCE is "hybrid".'
    )
  })

  it("returns summaries from the selected repository", async () => {
    const article = createArticle({ slug: "local", source: "local" })
    const service = createArticleService(
      { contentSource: "local" },
      { localSource: createRepository([article]) }
    )

    await expect(service.getArticles("en")).resolves.toEqual([
      {
        slug: article.slug,
        locale: article.locale,
        source: article.source,
        metadata: article.metadata,
      },
    ])
  })
})

describe("hybrid article source", () => {
  it("uses remote-over-local precedence and preserves ordering", async () => {
    const localDuplicate = createArticle({
      slug: "shared",
      source: "local",
      title: "Local",
      order: 2,
    })
    const remoteDuplicate = createArticle({
      slug: "shared",
      source: "remote",
      title: "Remote",
      order: 2,
    })
    const remoteFirst = createArticle({
      slug: "remote-first",
      source: "remote",
      order: 1,
    })

    const source = createHybridArticleSource({
      localSource: createRepository([localDuplicate]),
      remoteSource: createRepository([remoteDuplicate, remoteFirst]),
    })

    const articles = await source.list("en")

    expect(articles.map((article) => article.slug)).toEqual([
      "remote-first",
      "shared",
    ])
    expect(articles[1]).toEqual(remoteDuplicate)
  })

  it("uses remote-first detail lookup with local fallback", async () => {
    const localArticle = createArticle({ slug: "shared", source: "local" })
    const remoteArticle = createArticle({ slug: "shared", source: "remote" })
    const localSource = createRepository([localArticle])
    const remoteSource = createRepository([remoteArticle])
    const source = createHybridArticleSource({ localSource, remoteSource })

    await expect(source.get("en", "shared")).resolves.toEqual(remoteArticle)
    expect(localSource.get).not.toHaveBeenCalled()

    const fallbackSource = createHybridArticleSource({
      localSource,
      remoteSource: createRepository(),
    })
    await expect(fallbackSource.get("en", "shared")).resolves.toEqual(
      localArticle
    )
  })
})
