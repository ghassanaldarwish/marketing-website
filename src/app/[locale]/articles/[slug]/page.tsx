import type { Metadata } from "next"

import { notFound } from "next/navigation"
import { hasLocale } from "next-intl"
import { setRequestLocale } from "next-intl/server"

import { MdxRenderer } from "@/components/mdx/mdx-renderer"
import { routing } from "@/i18n/routing"
import { getArticle, type AppLocale } from "@/lib/mdx/get-article"
import {
  absoluteUrl,
  getOpenGraphLocale,
  isProductionDeployment,
  siteConfig,
} from "@/lib/site"
import Image from "next/image"

type ArticlePageProps = {
  params: Promise<{
    locale: string
    slug: string
  }>
}

export const runtime = "nodejs"
export const revalidate = 3600

function toIsoDate(date: string): string {
  return new Date(`${date}T00:00:00.000Z`).toISOString()
}

async function getArticleLanguageAlternates(slug: string): Promise<{
  languages: Record<string, string>
  availableLocales: AppLocale[]
}> {
  const localizedArticles = await Promise.all(
    routing.locales.map(async (locale) => {
      const typedLocale = locale as AppLocale

      return {
        locale: typedLocale,
        article: await getArticle(typedLocale, slug),
      }
    })
  )

  const languages: Record<string, string> = {}
  const availableLocales: AppLocale[] = []

  for (const localizedArticle of localizedArticles) {
    if (!localizedArticle.article) {
      continue
    }

    languages[localizedArticle.locale] =
      `/${localizedArticle.locale}/articles/${slug}`

    availableLocales.push(localizedArticle.locale)
  }

  const defaultLanguagePath =
    languages[routing.defaultLocale] ?? languages[availableLocales[0]]

  if (defaultLanguagePath) {
    languages["x-default"] = defaultLanguagePath
  }

  return {
    languages,
    availableLocales,
  }
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { locale, slug } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const typedLocale = locale as AppLocale
  const article = await getArticle(typedLocale, slug)

  if (!article) {
    notFound()
  }

  const { metadata } = article

  const articlePath = `/${locale}/articles/${slug}`
  const articleUrl = absoluteUrl(articlePath)

  const { languages, availableLocales } =
    await getArticleLanguageAlternates(slug)

  const publishedTime = toIsoDate(metadata.publishedAt)
  const modifiedTime = toIsoDate(metadata.updatedAt ?? metadata.publishedAt)

  return {
    /**
     * The parent layout adds:
     * | Ghassan
     */
    title: metadata.title,

    description: metadata.description,

    keywords: Array.from(
      new Set([
        ...metadata.tags,
        "Ghassan Aldarwish",
        "AI Engineering",
        "Backend Engineering",
      ])
    ),

    authors: [
      {
        name: siteConfig.fullName,
        url: absoluteUrl(`/${locale}/about`),
      },
    ],

    creator: siteConfig.fullName,
    publisher: siteConfig.fullName,

    category: metadata.tags[0] ?? "Software Engineering",

    alternates: {
      canonical: articlePath,
      languages,
    },

    openGraph: {
      type: "article",
      url: articleUrl,
      title: metadata.title,
      description: metadata.description,
      siteName: siteConfig.name,
      locale: getOpenGraphLocale(locale),
      alternateLocale: availableLocales
        .filter((availableLocale) => availableLocale !== typedLocale)
        .map(getOpenGraphLocale),
      publishedTime,
      modifiedTime,
      authors: [siteConfig.fullName],
      section: metadata.tags[0] ?? "Software Engineering",
      tags: metadata.tags,
    },

    twitter: {
      card: "summary_large_image",
      title: metadata.title,
      description: metadata.description,
      site: siteConfig.twitterHandle,
      creator: siteConfig.twitterHandle,
    },

    robots: {
      index: isProductionDeployment,
      follow: isProductionDeployment,

      googleBot: {
        index: isProductionDeployment,
        follow: isProductionDeployment,
        noimageindex: false,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { locale, slug } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const article = await getArticle(locale as AppLocale, slug)

  if (!article) {
    notFound()
  }

  const { metadata, body } = article

  const articlePath = `/${locale}/articles/${slug}`
  const articleUrl = absoluteUrl(articlePath)

  const socialImage = absoluteUrl(
    metadata.coverImage ?? siteConfig.defaultSocialImage
  )

  const imageAlt =
    metadata.coverImageAlt ??
    `${metadata.title} — article by ${siteConfig.fullName}`

  const publishedTime = toIsoDate(metadata.publishedAt)
  const modifiedTime = toIsoDate(metadata.updatedAt ?? metadata.publishedAt)

  const formattedPublishedDate = new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
  }).format(new Date(publishedTime))

  const formattedModifiedDate = metadata.updatedAt
    ? new Intl.DateTimeFormat(locale, {
        dateStyle: "long",
      }).format(new Date(modifiedTime))
    : null

  const wordCount = body.trim().split(/\s+/).filter(Boolean).length

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",

    headline: metadata.title,
    description: metadata.description,

    url: articleUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },

    image: [socialImage],

    datePublished: publishedTime,
    dateModified: modifiedTime,

    inLanguage: locale,
    wordCount,

    articleSection: metadata.tags[0] ?? "Software Engineering",

    keywords: metadata.tags.join(", "),

    author: {
      "@type": "Person",
      name: siteConfig.fullName,
      url: absoluteUrl(`/${locale}/about`),
    },

    publisher: {
      "@type": "Person",
      name: siteConfig.fullName,
      url: siteConfig.url.toString(),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <main className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6">
        <article className="prose max-w-none prose-neutral dark:prose-invert prose-headings:scroll-mt-24 prose-headings:font-semibold prose-a:text-primary prose-a:no-underline prose-a:hover:underline prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0">
          <header className="not-prose mb-12 border-b border-border pb-10">
            {metadata.tags.length > 0 && (
              <div className="mb-5 flex flex-wrap gap-2">
                {metadata.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
              {metadata.title}
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              {metadata.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <span>By {siteConfig.fullName}</span>

              <span aria-hidden="true">•</span>

              <time dateTime={publishedTime}>{formattedPublishedDate}</time>

              {formattedModifiedDate && (
                <>
                  <span aria-hidden="true">•</span>

                  <span>Updated {formattedModifiedDate}</span>
                </>
              )}
            </div>

            {metadata.coverImage && (
              <figure className="mt-10 overflow-hidden rounded-2xl border border-border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <Image
                  src={metadata.coverImage}
                  alt={imageAlt}
                  width={1200}
                  height={630}
                  sizes="(max-width: 768px) 100vw, 896px"
                  priority
                  className="aspect-1200/630 h-auto w-full object-contain"
                />
              </figure>
            )}
          </header>

          <MdxRenderer source={body} />
        </article>
      </main>
    </>
  )
}
