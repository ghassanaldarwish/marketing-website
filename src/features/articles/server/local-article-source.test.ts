import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import { afterEach, describe, expect, it } from "vitest"

import {
  createLocalArticleSource,
  LocalArticleSourceError,
} from "@/features/articles/server/local-article-source"

const temporaryDirectories: string[] = []

function rawArticle({
  title = "Example",
  draft = false,
}: {
  title?: string
  draft?: boolean
} = {}): string {
  return `---
title: "${title}"
description: "Example description"
category: "Engineering"
publishedAt: "2026-07-15"
coverImage: "/articles/example/cover.png"
coverImageAlt: "Example cover"
draft: ${draft}
---

Article body.
`
}

async function createContentDirectory(): Promise<string> {
  const directory = await mkdtemp(path.join(os.tmpdir(), "article-source-"))
  temporaryDirectories.push(directory)
  return directory
}

async function writeArticle(
  contentDirectory: string,
  locale: string,
  fileName: string,
  content: string
): Promise<void> {
  const localeDirectory = path.join(contentDirectory, locale)
  await mkdir(localeDirectory, { recursive: true })
  await writeFile(path.join(localeDirectory, fileName), content, "utf8")
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true })
    )
  )
})

describe("local article source", () => {
  it("returns an empty list for a missing locale directory", async () => {
    const contentDirectory = await createContentDirectory()
    const repository = createLocalArticleSource({ contentDirectory })

    await expect(repository.list("en")).resolves.toEqual([])
  })

  it("returns null for a missing slug", async () => {
    const contentDirectory = await createContentDirectory()
    const repository = createLocalArticleSource({ contentDirectory })

    await expect(repository.get("en", "missing-article")).resolves.toBeNull()
  })

  it("supports md and mdx files", async () => {
    const contentDirectory = await createContentDirectory()
    await writeArticle(
      contentDirectory,
      "en",
      "markdown.md",
      rawArticle({ title: "Markdown" })
    )
    await writeArticle(
      contentDirectory,
      "en",
      "mdx-article.mdx",
      rawArticle({ title: "MDX" })
    )

    const repository = createLocalArticleSource({
      contentDirectory,
      getRuntimeMode: () => "test",
    })

    await expect(repository.list("en")).resolves.toMatchObject([
      { slug: "markdown", metadata: { title: "Markdown" } },
      { slug: "mdx-article", metadata: { title: "MDX" } },
    ])
  })

  it("prefers mdx when both extensions exist", async () => {
    const contentDirectory = await createContentDirectory()
    await writeArticle(
      contentDirectory,
      "en",
      "shared.md",
      rawArticle({ title: "Markdown" })
    )
    await writeArticle(
      contentDirectory,
      "en",
      "shared.mdx",
      rawArticle({ title: "MDX" })
    )

    const repository = createLocalArticleSource({ contentDirectory })
    const listed = await repository.list("en")
    const article = await repository.get("en", "shared")

    expect(listed).toHaveLength(1)
    expect(listed[0]?.metadata.title).toBe("MDX")
    expect(article?.metadata.title).toBe("MDX")
  })

  it("filters drafts from list and get in production", async () => {
    const contentDirectory = await createContentDirectory()
    await writeArticle(
      contentDirectory,
      "en",
      "draft.mdx",
      rawArticle({ draft: true })
    )

    const repository = createLocalArticleSource({
      contentDirectory,
      getRuntimeMode: () => "production",
    })

    await expect(repository.list("en")).resolves.toEqual([])
    await expect(repository.get("en", "draft")).resolves.toBeNull()
  })

  it("keeps drafts outside production", async () => {
    const contentDirectory = await createContentDirectory()
    await writeArticle(
      contentDirectory,
      "en",
      "draft.mdx",
      rawArticle({ draft: true })
    )

    const repository = createLocalArticleSource({
      contentDirectory,
      getRuntimeMode: () => "test",
    })

    await expect(repository.get("en", "draft")).resolves.toMatchObject({
      metadata: { draft: true },
    })
  })

  it("throws a contextual error for malformed content", async () => {
    const contentDirectory = await createContentDirectory()
    await writeArticle(contentDirectory, "en", "broken.mdx", "---\ntitle: ''\n---")

    const repository = createLocalArticleSource({ contentDirectory })

    await expect(repository.get("en", "broken")).rejects.toThrow(
      'Could not parse local article "en/broken".'
    )
  })

  it("preserves typed filesystem error codes and causes", async () => {
    const contentDirectory = await createContentDirectory()
    await writeFile(path.join(contentDirectory, "en"), "not a directory", "utf8")

    const repository = createLocalArticleSource({ contentDirectory })

    try {
      await repository.list("en")
      throw new Error("Expected list to fail")
    } catch (error) {
      expect(error).toBeInstanceOf(LocalArticleSourceError)
      expect((error as LocalArticleSourceError).code).toBe("ENOTDIR")
      expect((error as Error).cause).toBeInstanceOf(Error)
    }
  })
})
