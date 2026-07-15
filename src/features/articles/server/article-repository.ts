import "server-only"

import type { Article } from "@/features/articles/domain/article"

export interface ArticleRepository {
  list(locale: string): Promise<Article[]>
  get(locale: string, slug: string): Promise<Article | null>
}
