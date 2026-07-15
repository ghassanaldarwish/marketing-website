import { notFound } from "next/navigation"
import { hasLocale } from "next-intl"

import {
  createArticleSocialImage,
  socialImageSize,
} from "@/components/seo/article-social-image"

import { getArticle, type AppLocale } from "@/features/articles/server"
import { routing } from "@/i18n/routing"

export const runtime = "nodejs"

export const alt = "Article by Ghassan Aldarwish"
export const size = socialImageSize
export const contentType = "image/png"

type ArticleSocialImageProps = {
  params: Promise<{
    locale: string
    slug: string
  }>
}

export default async function OpenGraphImage({
  params,
}: ArticleSocialImageProps) {
  const { locale, slug } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const article = await getArticle(locale as AppLocale, slug)

  if (!article) {
    notFound()
  }

  return createArticleSocialImage({
    metadata: article.metadata,
  })
}
