import { describe, expect, it } from "vitest"

import {
  ARTICLE_READING_WORDS_PER_MINUTE,
  ARTICLE_TOC_MINIMUM_WORDS,
  getArticleReadingMetrics,
} from "@/features/articles/domain/article-reading"

function words(count: number): string {
  return Array.from({ length: count }, () => "word").join(" ")
}

describe("article reading metrics", () => {
  it("derives a minimum one-minute reading time from the article body", () => {
    expect(getArticleReadingMetrics("").readingMinutes).toBe(1)
    expect(
      getArticleReadingMetrics(words(ARTICLE_READING_WORDS_PER_MINUTE + 1))
        .readingMinutes
    ).toBe(2)
  })

  it("creates a table of contents for sufficiently long articles", () => {
    const body = `${words(ARTICLE_TOC_MINIMUM_WORDS)}

## The problem

## High-level **architecture**

## The problem
`

    expect(getArticleReadingMetrics(body).tableOfContents).toEqual([
      { id: "the-problem", title: "The problem" },
      { id: "high-level-architecture", title: "High-level architecture" },
      { id: "the-problem-1", title: "The problem" },
    ])
  })

  it("omits the table of contents for shorter articles", () => {
    const body = `${words(ARTICLE_TOC_MINIMUM_WORDS - 20)}

## First

## Second

## Third
`

    expect(getArticleReadingMetrics(body).tableOfContents).toEqual([])
  })

  it("ignores heading-like content inside fenced code blocks", () => {
    const body = `${words(ARTICLE_TOC_MINIMUM_WORDS)}

## Visible one

\`\`\`md
## Not a heading
\`\`\`

## Visible two

## Visible three
`

    expect(
      getArticleReadingMetrics(body).tableOfContents.map(({ title }) => title)
    ).toEqual(["Visible one", "Visible two", "Visible three"])
  })
})
