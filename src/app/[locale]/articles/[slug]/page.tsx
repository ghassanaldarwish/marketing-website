import type { Metadata } from "next"

import Image from "next/image"
import { notFound } from "next/navigation"
import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { MdxRenderer } from "@/components/mdx/mdx-renderer"

import { getArticleReadingMetrics } from "@/features/articles/domain/article-reading"
import { getArticle, type AppLocale } from "@/features/articles/server"
import { getArticleLanguageAlternates } from "@/i18n/alternates"
import { createArticlePath } from "@/i18n/paths"
import { routing } from "@/i18n/routing"
import { absoluteUrl, getOpenGraphLocale, siteConfig } from "@/lib/config/site"
import { toIsoDate } from "@/lib/dates"

type ArticlePageProps = {
  params: Promise<{
    locale: string
    slug: string
  }>
}

export const runtime = "nodejs"
export const revalidate = 3600

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { locale, slug } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const typedLocale = locale as AppLocale

  const [article, t] = await Promise.all([
    getArticle(typedLocale, slug),

    getTranslations({
      locale,
      namespace: "article.metadata",
    }),
  ])

  if (!article) {
    notFound()
  }

  const { metadata } = article

  const articlePath = createArticlePath(typedLocale, slug)
  const articleUrl = absoluteUrl(articlePath)

  const { languages, availableLocales } = await getArticleLanguageAlternates(
    slug,
    getArticle
  )

  const publishedTime = toIsoDate(metadata.publishedAt)
  const modifiedTime = toIsoDate(metadata.updatedAt ?? metadata.publishedAt)

  const defaultKeywords = t.raw("defaultKeywords") as string[]
  const defaultCategory = t("defaultCategory")

  const category = metadata.category || metadata.tags[0] || defaultCategory

  const keywords = Array.from(
    new Set([...metadata.tags, ...metadata.stack, ...defaultKeywords])
  )

  return {
    /**
     * The locale layout applies:
     *
     * Article title | Ghassan
     */
    title: metadata.title,

    description: metadata.description,
    keywords,
    category,

    alternates: {
      canonical: articleUrl,
      languages,
    },

    /**
     * Social images are generated automatically by:
     *
     * app/[locale]/articles/[slug]/opengraph-image.tsx
     * app/[locale]/articles/[slug]/twitter-image.tsx
     */
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

      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),

      authors: [absoluteUrl(`/${locale}/about`)],

      section: category,
      tags: metadata.tags,
    },

    twitter: {
      card: "summary_large_image",
      title: metadata.title,
      description: metadata.description,
      site: siteConfig.twitterHandle,
      creator: siteConfig.twitterHandle,
    },
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { locale, slug } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const [article, content, metadataTranslations] = await Promise.all([
    getArticle(locale as AppLocale, slug),

    getTranslations({
      locale,
      namespace: "article.content",
    }),

    getTranslations({
      locale,
      namespace: "article.metadata",
    }),
  ])

  if (!article) {
    notFound()
  }

  const { metadata, body } = article

  const articlePath = createArticlePath(locale as AppLocale, slug)
  const articleUrl = absoluteUrl(articlePath)

  const siteUrl = siteConfig.url.toString()
  const aboutUrl = absoluteUrl(`/${locale}/about`)

  const websiteId = `${siteUrl}#website`
  const personId = `${siteUrl}#person`
  const webpageId = `${articleUrl}#webpage`
  const articleId = `${articleUrl}#article`

  const publishedTime = toIsoDate(metadata.publishedAt)
  const modifiedTime = toIsoDate(metadata.updatedAt ?? metadata.publishedAt)

  const formattedPublishedDate = publishedTime
    ? new Intl.DateTimeFormat(locale, {
        dateStyle: "long",
      }).format(new Date(publishedTime))
    : null

  const formattedModifiedDate =
    metadata.updatedAt && modifiedTime
      ? new Intl.DateTimeFormat(locale, {
          dateStyle: "long",
        }).format(new Date(modifiedTime))
      : null

  const imageAlt =
    metadata.coverImageAlt ??
    content("coverImageAlt", {
      title: metadata.title,
      author: siteConfig.fullName,
    })

  const defaultCategory = metadataTranslations("defaultCategory")

  const articleSection =
    metadata.category || metadata.tags[0] || defaultCategory

  const { wordCount, readingMinutes, tableOfContents } =
    getArticleReadingMetrics(body)

  const articleKeywords = Array.from(
    new Set([...metadata.tags, ...metadata.stack])
  )

  const jsonLd = {
    "@context": "https://schema.org",

    "@graph": [
      {
        "@type": "WebPage",
        "@id": webpageId,

        url: articleUrl,
        name: metadata.title,
        description: metadata.description,
        inLanguage: locale,

        isPartOf: {
          "@id": websiteId,
        },

        about: {
          "@id": articleId,
        },

        mainEntity: {
          "@id": articleId,
        },
      },

      {
        "@type": "TechArticle",
        "@id": articleId,

        headline: metadata.title,
        name: metadata.title,
        description: metadata.description,

        url: articleUrl,

        mainEntityOfPage: {
          "@id": webpageId,
        },

        ...(metadata.coverImage
          ? {
              image: {
                "@type": "ImageObject",
                url: absoluteUrl(metadata.coverImage),
                width: 1200,
                height: 630,
              },
            }
          : {}),

        ...(publishedTime ? { datePublished: publishedTime } : {}),
        ...(modifiedTime ? { dateModified: modifiedTime } : {}),

        inLanguage: locale,
        wordCount,

        articleSection,
        genre: metadata.category,

        keywords: articleKeywords.join(", "),

        author: {
          "@id": personId,
        },

        publisher: {
          "@id": personId,
        },
      },

      {
        "@type": "Person",
        "@id": personId,

        name: siteConfig.fullName,
        alternateName: siteConfig.handle,

        url: aboutUrl,

        image: {
          "@type": "ImageObject",
          url: absoluteUrl(siteConfig.profileImage),
        },

        sameAs: [
          siteConfig.socialLinks.linkedin,
          siteConfig.socialLinks.github,
        ],
      },
    ],
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
        <article
          key={`${locale}:${slug}`}
          className="prose max-w-none prose-neutral dark:prose-invert prose-headings:scroll-mt-24 prose-headings:font-semibold prose-a:text-primary prose-a:no-underline prose-a:hover:underline prose-code:font-mono prose-code:text-foreground prose-code:opacity-100 prose-code:before:content-none prose-code:after:content-none prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:border prose-pre:border-border prose-pre:bg-muted/60 prose-pre:px-5 prose-pre:py-4 prose-pre:text-sm prose-pre:leading-7 prose-pre:text-foreground"
        >
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

            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              {metadata.title}
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              {metadata.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <span>
                {content("authorPrefix")} {siteConfig.fullName}
              </span>

              {formattedPublishedDate && publishedTime && (
                <>
                  <span aria-hidden="true">•</span>
                  <time dateTime={publishedTime}>{formattedPublishedDate}</time>
                </>
              )}

              {formattedModifiedDate && (
                <>
                  <span aria-hidden="true">•</span>

                  <span>
                    {content("updatedPrefix")} {formattedModifiedDate}
                  </span>
                </>
              )}

              <span aria-hidden="true">•</span>
              <span>{content("readingTime", { minutes: readingMinutes })}</span>
            </div>

            {metadata.coverImage && (
              <figure className="mt-10 overflow-hidden rounded-2xl border border-border bg-muted">
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

          {tableOfContents.length > 0 && (
            <nav
              data-article-toc
              aria-label={content("tableOfContentsLabel")}
              className="not-prose mx-auto mb-12 max-w-[70ch] rounded-2xl border border-border bg-muted/35 p-5 sm:p-6"
            >
              <h2 className="text-base font-semibold text-foreground">
                {content("tableOfContentsTitle")}
              </h2>

              <ol className="mt-4 grid gap-x-8 gap-y-2 text-sm text-muted-foreground sm:grid-cols-2">
                {tableOfContents.map(({ id, title }) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      className="inline-flex rounded-sm py-1 hover:text-foreground hover:underline"
                    >
                      {title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div data-article-prose className="min-w-0">
            <MdxRenderer
              key={`${locale}:${slug}`}
              source={body}
              headingAnchorLabel={content("headingAnchorLabel")}
            />
          </div>
        </article>
      </main>
    </>
  )
}
