import { sortArticles } from "@/features/articles/domain/article-policy"
import type { ArticleSummary } from "@/lib/mdx/article-schema"

/**
 * Selects published article summaries that are intended for the Home page.
 *
 * The selected collection is sorted with the shared article policy so the
 * Home page consistently respects featured state, explicit order,
 * publication date, and title regardless of filesystem enumeration order.
 */
export function selectFeaturedArticles(
  articles: readonly ArticleSummary[]
): ArticleSummary[] {
  return sortArticles(
    articles.filter(
      ({ metadata }) => metadata.featured || metadata.order !== undefined
    )
  )
}
