import type { Metadata } from "next"

import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

import { routing } from "@/i18n/routing"
import type { ArticleSummary } from "@/lib/mdx/article-schema"
import { getArticles, type AppLocale } from "@/lib/mdx/get-article"
import { absoluteUrl, getOpenGraphLocale, siteConfig } from "@/lib/site"

type ArticlesPageProps = {
  params: Promise<{
    locale: string
  }>
}

type ArticlesStructuredData = {
  pageName: string
}

function getLanguageAlternates(): Record<string, string> {
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((locale) => [
      locale,
      absoluteUrl(`/${locale}/articles`),
    ])
  )

  languages["x-default"] = absoluteUrl(`/${routing.defaultLocale}/articles`)

  return languages
}

function createArticlePath(locale: string, slug: string): string {
  return `/${locale}/articles/${slug}`
}

function getArticleDate(article: ArticleSummary): string {
  return article.metadata.updatedAt ?? article.metadata.publishedAt
}

function toIsoDate(date: string): string {
  return `${date}T00:00:00.000Z`
}

export async function generateMetadata({
  params,
}: ArticlesPageProps): Promise<Metadata> {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const t = await getTranslations({
    locale,
    namespace: "articles.metadata",
  })

  const title = t("title")
  const description = t("description")
  const keywords = t.raw("keywords") as string[]

  const pageUrl = absoluteUrl(`/${locale}/articles`)

  return {
    title,
    description,
    keywords,

    alternates: {
      canonical: pageUrl,
      languages: getLanguageAlternates(),
    },

    /**
     * Images are provided automatically by:
     *
     * app/[locale]/articles/opengraph-image.tsx
     * app/[locale]/articles/twitter-image.tsx
     */
    openGraph: {
      type: "website",
      url: pageUrl,
      title,
      description,
      siteName: siteConfig.name,
      locale: getOpenGraphLocale(locale),

      alternateLocale: routing.locales
        .filter((supportedLocale) => supportedLocale !== locale)
        .map(getOpenGraphLocale),
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: siteConfig.twitterHandle,
      creator: siteConfig.twitterHandle,
    },
  }
}

export default async function ArticlesPage({ params }: ArticlesPageProps) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const [articles, metadata, content] = await Promise.all([
    getArticles(locale as AppLocale),

    getTranslations({
      locale,
      namespace: "articles.metadata",
    }),

    getTranslations({
      locale,
      namespace: "articles.content",
    }),
  ])

  const structuredData = metadata.raw(
    "structuredData"
  ) as ArticlesStructuredData

  const siteUrl = siteConfig.url.toString()
  const pageUrl = absoluteUrl(`/${locale}/articles`)

  const websiteId = `${siteUrl}#website`
  const personId = `${siteUrl}#person`
  const collectionPageId = `${pageUrl}#webpage`
  const itemListId = `${pageUrl}#item-list`

  const jsonLd = {
    "@context": "https://schema.org",

    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": collectionPageId,

        name: structuredData.pageName,
        description: metadata("description"),
        url: pageUrl,
        inLanguage: locale,

        isPartOf: {
          "@id": websiteId,
        },

        author: {
          "@id": personId,
        },

        about: {
          "@id": personId,
        },

        mainEntity: {
          "@id": itemListId,
        },
      },

      {
        "@type": "ItemList",
        "@id": itemListId,

        numberOfItems: articles.length,

        itemListElement: articles.map((article, index) => {
          const articlePath = createArticlePath(locale, article.slug)
          const articleUrl = absoluteUrl(articlePath)

          return {
            "@type": "ListItem",
            position: index + 1,
            url: articleUrl,

            item: {
              "@type": "TechArticle",
              "@id": `${articleUrl}#article`,

              name: article.metadata.title,
              headline: article.metadata.title,
              description: article.metadata.description,

              url: articleUrl,
              mainEntityOfPage: articleUrl,

              ...(article.metadata.coverImage
                ? {
                    image: absoluteUrl(article.metadata.coverImage),
                  }
                : {}),

              genre: article.metadata.category,

              keywords: [
                ...article.metadata.tags,
                ...article.metadata.stack,
              ].join(", "),

              datePublished: toIsoDate(article.metadata.publishedAt),

              dateModified: toIsoDate(getArticleDate(article)),

              inLanguage: locale,

              author: {
                "@id": personId,
              },

              publisher: {
                "@id": personId,
              },
            },
          }
        }),
      },

      {
        "@type": "Person",
        "@id": personId,

        name: siteConfig.fullName,
        alternateName: siteConfig.handle,

        url: absoluteUrl(`/${locale}/about`),

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

      <main className="min-h-screen">
        <section
          id="all-projects"
          aria-labelledby="engineering-heading"
          className="py-16 lg:py-24"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <header className="max-w-3xl">
              <p className="mb-3 text-sm font-medium tracking-widest text-accent-foreground uppercase">
                {content("eyebrow")}
              </p>

              <h1
                id="engineering-heading"
                className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
              >
                {content("title")}
              </h1>

              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                {content("description")}
              </p>
            </header>

            {articles.length > 0 ? (
              <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => {
                  const { metadata: articleMetadata, slug } = article

                  const articleHref = createArticlePath(locale, slug)

                  const formattedDate = new Intl.DateTimeFormat(locale, {
                    dateStyle: "medium",
                  }).format(
                    new Date(`${articleMetadata.publishedAt}T00:00:00.000Z`)
                  )

                  return (
                    <Link
                      key={slug}
                      href={articleHref}
                      aria-label={content("readArticleLabel", {
                        title: articleMetadata.title,
                      })}
                      className="group block rounded-3xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background focus-visible:outline-none"
                    >
                      <Card className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-foreground/2 p-0 transition duration-300 group-hover:-translate-y-1 group-hover:border-foreground/20 group-hover:bg-foreground/4">
                        {articleMetadata.coverImage && (
                          <div className="relative aspect-1200/630 overflow-hidden border-b border-border bg-muted">
                            <Image
                              src={articleMetadata.coverImage}
                              alt={
                                articleMetadata.coverImageAlt ??
                                articleMetadata.title
                              }
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            />
                          </div>
                        )}

                        <div className="flex flex-1 flex-col p-6">
                          <p className="text-sm font-medium text-accent-foreground">
                            {articleMetadata.category}
                          </p>

                          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                            {articleMetadata.title}
                          </h2>

                          <p className="mt-4 leading-7 text-muted-foreground">
                            {articleMetadata.description}
                          </p>

                          {articleMetadata.stack.length > 0 && (
                            <div
                              className="mt-6 flex flex-wrap gap-2"
                              aria-label={content("technologiesLabel", {
                                title: articleMetadata.title,
                              })}
                            >
                              {articleMetadata.stack
                                .slice(0, 5)
                                .map((technology) => (
                                  <Badge
                                    key={technology}
                                    variant="outline"
                                    className="px-3 py-1 text-xs text-muted-foreground"
                                  >
                                    {technology}
                                  </Badge>
                                ))}
                            </div>
                          )}

                          <div className="mt-auto flex items-end justify-between gap-4 pt-8">
                            <time
                              dateTime={articleMetadata.publishedAt}
                              className="text-xs text-muted-foreground"
                            >
                              {formattedDate}
                            </time>

                            <span className="inline-flex items-center text-sm font-medium text-accent-foreground">
                              {content("viewCaseStudy")}

                              <ArrowRight
                                className="ms-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                                aria-hidden="true"
                              />
                            </span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="mt-12 rounded-3xl border border-dashed border-border bg-foreground/2 p-10 text-center">
                <h2 className="text-2xl font-semibold">
                  {content("emptyTitle")}
                </h2>

                <p className="mt-3 text-muted-foreground">
                  {content("emptyDescription")}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
