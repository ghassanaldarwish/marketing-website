import {
  copyFile,
  cp,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"

import { afterEach, beforeEach, describe, expect, it } from "vitest"

import {
  runContentCheck,
  validateContent,
} from "../../../../scripts/content-check"

const repositoryRoot = process.cwd()

type CapturedRun = {
  exitCode: number
  messages: string[]
}

describe("content validation command", () => {
  let fixtureRoot: string

  beforeEach(async () => {
    fixtureRoot = await mkdtemp(path.join(tmpdir(), "content-check-"))
    await Promise.all([
      cp(
        path.join(repositoryRoot, "content"),
        path.join(fixtureRoot, "content"),
        {
          recursive: true,
        }
      ),
      cp(
        path.join(repositoryRoot, "public"),
        path.join(fixtureRoot, "public"),
        {
          recursive: true,
        }
      ),
    ])
  })

  afterEach(async () => {
    await rm(fixtureRoot, { recursive: true, force: true })
  })

  async function runFixture(): Promise<CapturedRun> {
    const messages: string[] = []
    const exitCode = await runContentCheck({
      rootDirectory: fixtureRoot,
      output: {
        log: (message) => messages.push(message),
        error: (message) => messages.push(message),
      },
    })

    return { exitCode, messages }
  }

  function articlePath(
    locale = "en",
    slug = "scalable-backend-platform"
  ): string {
    return path.join(fixtureRoot, "content", "articles", locale, `${slug}.mdx`)
  }

  it("exits zero for the current EN, DE, and AR content", async () => {
    await expect(validateContent(repositoryRoot)).resolves.toEqual([])

    const result = await runFixture()

    expect(result).toEqual({
      exitCode: 0,
      messages: ["Content validation passed for en, de, ar."],
    })
  })

  it("reports a missing localized dictionary namespace with its path", async () => {
    const dictionaryPath = path.join(
      fixtureRoot,
      "content",
      "dictionaries",
      "ar.json"
    )
    const dictionary = JSON.parse(
      await readFile(dictionaryPath, "utf8")
    ) as Record<string, unknown>
    delete dictionary.home
    await writeFile(dictionaryPath, JSON.stringify(dictionary), "utf8")

    const result = await runFixture()

    expect(result.exitCode).toBe(1)
    expect(result.messages.join("\n")).toContain(
      '[locale=ar slug=dictionary file=content/dictionaries/ar.json] Missing required dictionary namespace "home".'
    )
  })

  it("rejects a non-object locale dictionary", async () => {
    const dictionaryPath = path.join(
      fixtureRoot,
      "content",
      "dictionaries",
      "ar.json"
    )
    await writeFile(dictionaryPath, "null", "utf8")

    const result = await runFixture()

    expect(result.exitCode).toBe(1)
    expect(result.messages.join("\n")).toContain(
      "[locale=ar slug=dictionary file=content/dictionaries/ar.json] Locale dictionary must be a JSON object."
    )
  })

  it("reports invalid frontmatter through the production article parser", async () => {
    const filePath = articlePath()
    const article = await readFile(filePath, "utf8")
    await writeFile(
      filePath,
      article.replace('publishedAt: "2026-07-12"', 'publishedAt: "invalid"'),
      "utf8"
    )

    const result = await runFixture()

    expect(result.exitCode).toBe(1)
    expect(result.messages.join("\n")).toMatch(
      /locale=en slug=scalable-backend-platform file=content\/articles\/en\/scalable-backend-platform\.mdx.*Invalid article: Invalid frontmatter/
    )
  })

  it("reports duplicate locale and slug identities", async () => {
    await copyFile(
      articlePath(),
      path.join(
        fixtureRoot,
        "content",
        "articles",
        "en",
        "scalable-backend-platform.md"
      )
    )

    const result = await runFixture()

    expect(result.exitCode).toBe(1)
    expect(result.messages.join("\n")).toContain(
      "Duplicate local locale/slug identity"
    )
    expect(result.messages.join("\n")).toContain(
      "file=content/articles/en/scalable-backend-platform.mdx"
    )
  })

  it("reports Markdown files with invalid names", async () => {
    await copyFile(
      articlePath(),
      path.join(fixtureRoot, "content", "articles", "en", "Invalid Article.mdx")
    )

    const result = await runFixture()

    expect(result.exitCode).toBe(1)
    expect(result.messages.join("\n")).toContain(
      "[locale=en slug=Invalid Article.mdx file=content/articles/en/Invalid Article.mdx] Invalid article filename"
    )
  })

  it("reports missing cover assets", async () => {
    const filePath = articlePath()
    const article = await readFile(filePath, "utf8")
    await writeFile(
      filePath,
      article.replace(
        "/articles/scalable-backend-platform/cover.png",
        "/articles/missing/cover.png"
      ),
      "utf8"
    )

    const result = await runFixture()

    expect(result.exitCode).toBe(1)
    expect(result.messages.join("\n")).toContain(
      '[locale=en slug=scalable-backend-platform file=content/articles/en/scalable-backend-platform.mdx] Missing cover image "/articles/missing/cover.png"'
    )
  })

  it("reports malformed fixture-only remote indexes without fetching", async () => {
    const indexPath = path.join(
      fixtureRoot,
      "content",
      "articles",
      "de",
      "index.json"
    )
    await writeFile(indexPath, '{"files":["invalid.txt"]}', "utf8")

    const result = await runFixture()

    expect(result.exitCode).toBe(1)
    expect(result.messages.join("\n")).toMatch(
      /locale=de slug=remote-index file=content\/articles\/de\/index\.json.*Malformed remote index fixture/
    )
  })

  it("reports explicit placeholder markers", async () => {
    const filePath = articlePath()
    const article = await readFile(filePath, "utf8")
    await writeFile(
      filePath,
      `${article}\n\nTODO: replace this section.\n`,
      "utf8"
    )

    const result = await runFixture()

    expect(result.exitCode).toBe(1)
    expect(result.messages.join("\n")).toMatch(
      /locale=en slug=scalable-backend-platform file=content\/articles\/en\/scalable-backend-platform\.mdx.*Prohibited placeholder/
    )
  })

  it("rejects an accidental leading delimiter but allows later horizontal rules", async () => {
    const filePath = articlePath()
    const article = await readFile(filePath, "utf8")
    const withLeadingDelimiter = article.replace(
      /\n---\n\n/,
      "\n---\n\n---\n\n"
    )
    await writeFile(filePath, withLeadingDelimiter, "utf8")

    const invalidResult = await runFixture()

    expect(invalidResult.exitCode).toBe(1)
    expect(invalidResult.messages.join("\n")).toContain(
      "Article body begins with an accidental frontmatter delimiter."
    )

    await writeFile(
      filePath,
      `${article}\n\nA legitimate section break follows.\n\n---\n\nMore content.\n`,
      "utf8"
    )

    await expect(runFixture()).resolves.toMatchObject({ exitCode: 0 })
  })
})
