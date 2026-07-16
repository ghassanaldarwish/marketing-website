import GithubSlugger from "github-slugger"

export const ARTICLE_READING_WORDS_PER_MINUTE = 225
export const ARTICLE_TOC_MINIMUM_WORDS = 1_000

export type ArticleTableOfContentsItem = {
  id: string
  title: string
}

export type ArticleReadingMetrics = {
  wordCount: number
  readingMinutes: number
  tableOfContents: ArticleTableOfContentsItem[]
}

const fencedCodeBlockPattern = /^```[\s\S]*?^```[^\n]*$/gm
const levelTwoHeadingPattern = /^ {0,3}##[ \t]+(.+?)[ \t]*#*[ \t]*$/gm

function getHeadingText(markdown: string): string {
  return markdown
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<\/?[^>]+>/g, "")
    .replace(/[`*_~]/g, "")
    .replace(/\\([\\`*_\[\]{}()#+\-.!])/g, "$1")
    .replace(/\s+/g, " ")
    .trim()
}

function getLevelTwoHeadings(source: string): ArticleTableOfContentsItem[] {
  const sourceWithoutCodeBlocks = source.replace(fencedCodeBlockPattern, "")
  const slugger = new GithubSlugger()

  return Array.from(
    sourceWithoutCodeBlocks.matchAll(levelTwoHeadingPattern),
    ([, markdownHeading]) => {
      const title = getHeadingText(markdownHeading)

      return {
        id: slugger.slug(title),
        title,
      }
    }
  ).filter((heading) => heading.title.length > 0)
}

export function getArticleReadingMetrics(body: string): ArticleReadingMetrics {
  const wordCount = body.trim().split(/\s+/).filter(Boolean).length
  const readingMinutes = Math.max(
    1,
    Math.ceil(wordCount / ARTICLE_READING_WORDS_PER_MINUTE)
  )
  const headings = getLevelTwoHeadings(body)

  return {
    wordCount,
    readingMinutes,
    tableOfContents:
      wordCount >= ARTICLE_TOC_MINIMUM_WORDS && headings.length >= 3
        ? headings
        : [],
  }
}
