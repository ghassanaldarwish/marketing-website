import type { ArticleSummary } from "@/lib/mdx/article-schema"

/**
 * Selects published article summaries that are intended for the Home page.
 *
 * `getArticles()` already removes production drafts and sorts articles by
 * featured state, explicit order, publication date, and title. An explicit
 * order remains a supported opt-in for existing case studies while new
 * content can use the preferred `featured: true` frontmatter field.
 */
export function selectFeaturedArticles(
  articles: readonly ArticleSummary[]
): ArticleSummary[] {
  return articles.filter(
    ({ metadata }) => metadata.featured || metadata.order !== undefined
  )
}
