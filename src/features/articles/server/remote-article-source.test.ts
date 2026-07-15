import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

import {
  createRemoteArticleSource,
  RemoteArticleSourceError,
} from "@/features/articles/server/remote-article-source"

function rawArticle(title = "Example"): string {
  return `---
title: "${title}"
description: "Example description"
category: "Engineering"
publishedAt: "2026-07-15"
coverImage: "/articles/example/cover.png"
coverImageAlt: "Example cover"
draft: false
---

Article body.
`
}

function createSource(fetchImpl: typeof fetch, token?: string) {
  return createRemoteArticleSource({
    baseUrl: "https://content.example/articles/",
    token,
    revalidateSeconds: 120,
    timeoutMs: 25,
    fetchImpl,
    getRuntimeMode: () => "test",
  })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe("remote article source", () => {
  it("lists and reads remote articles through the repository contract", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async (input) => {
      const url = String(input)

      if (url.endsWith("/en/index.json")) {
        return Response.json({ files: ["first.mdx"] })
      }

      return new Response(rawArticle("First"))
    })
    const repository = createSource(fetchImpl)

    await expect(repository.list("en")).resolves.toMatchObject([
      {
        slug: "first",
        source: "remote",
        metadata: { title: "First" },
      },
    ])
    await expect(repository.get("en", "first")).resolves.toMatchObject({
      slug: "first",
      source: "remote",
    })
  })

  it("returns empty and null behavior for 404 responses", async () => {
    const fetchImpl = vi.fn<typeof fetch>(
      async () => new Response(null, { status: 404 })
    )
    const repository = createSource(fetchImpl)

    await expect(repository.list("en")).resolves.toEqual([])
    await expect(repository.get("en", "missing")).resolves.toBeNull()
  })

  it("preserves authorization, revalidation, and cache tags", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () =>
      Response.json({ files: [] })
    )
    const repository = createSource(fetchImpl, "test-secret")

    await repository.list("en")

    const [, init] = fetchImpl.mock.calls[0] ?? []
    const headers = new Headers(init?.headers)
    const next = (
      init as RequestInit & {
        next?: { revalidate: number; tags: string[] }
      }
    ).next

    expect(headers.get("Authorization")).toBe("Bearer test-secret")
    expect(next).toEqual({
      revalidate: 120,
      tags: ["articles:en"],
    })
  })

  it("rejects an invalid remote index with a contextual error", async () => {
    const repository = createSource(
      vi.fn<typeof fetch>(async () => Response.json({ files: ["invalid.txt"] }))
    )

    await expect(repository.list("en")).rejects.toMatchObject({
      code: "INVALID_INDEX",
      message: 'Invalid remote article index for "en".',
    })
  })

  it("rejects a missing file referenced by the index", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async (input) =>
      String(input).endsWith("/index.json")
        ? Response.json(["missing.mdx"])
        : new Response(null, { status: 404 })
    )
    const repository = createSource(fetchImpl)

    await expect(repository.list("en")).rejects.toMatchObject({
      code: "MISSING_INDEXED_ARTICLE",
      message: 'Remote index references a missing article: "en/missing.mdx".',
    })
  })

  it("aborts requests that exceed the configured timeout", async () => {
    const fetchImpl = vi.fn<typeof fetch>(
      async (_input, init) =>
        await new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"))
          })
        })
    )
    const repository = createSource(fetchImpl)

    await expect(repository.list("en")).rejects.toMatchObject({
      code: "REQUEST_TIMEOUT",
      message: "Remote article request timed out after 25ms.",
    })
  })

  it("reports non-2xx responses without exposing the token", async () => {
    const repository = createSource(
      vi.fn<typeof fetch>(
        async () =>
          new Response(null, {
            status: 503,
            statusText: "Service Unavailable",
          })
      ),
      "super-secret-token"
    )

    try {
      await repository.list("en")
      throw new Error("Expected remote request to fail")
    } catch (error) {
      expect(error).toBeInstanceOf(RemoteArticleSourceError)
      expect((error as RemoteArticleSourceError).code).toBe("HTTP_ERROR")
      expect((error as RemoteArticleSourceError).status).toBe(503)
      expect((error as Error).message).not.toContain("super-secret-token")
    }
  })
})
