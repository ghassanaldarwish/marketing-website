import type { Metadata } from "next"

import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { hasLocale } from "next-intl"
import { setRequestLocale } from "next-intl/server"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

import { routing } from "@/i18n/routing"
import { getArticles, type AppLocale } from "@/lib/mdx/get-article"
import type { ArticleSummary } from "@/lib/mdx/article-schema"
import {
  absoluteUrl,
  getOpenGraphLocale,
  isProductionDeployment,
  siteConfig,
} from "@/lib/site"

type EngineeringPageProps = {
  params: Promise<{
    locale: string
  }>
}

const pageMetadata = {
  title: "Engineering",

  description:
    "Explore software systems, AI platforms, backend architectures, automation workflows and cloud infrastructure designed by Ghassan Aldarwish.",
}

function getLanguageAlternates(): Record<string, string> {
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((locale) => [locale, `/${locale}/articles`])
  )

  languages["x-default"] = `/${routing.defaultLocale}/articles`

  return languages
}

function createArticleUrl(locale: string, slug: string): string {
  return `/${locale}/articles/${slug}`
}

function getArticleDate(article: ArticleSummary): string {
  return article.metadata.updatedAt ?? article.metadata.publishedAt
}

export async function generateMetadata({
  params,
}: EngineeringPageProps): Promise<Metadata> {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const pagePath = `/${locale}/articles`
  const pageUrl = absoluteUrl(pagePath)

  return {
    title: pageMetadata.title,
    description: pageMetadata.description,

    keywords: [
      "Ghassan Aldarwish Projects",
      "Software Engineering Projects",
      "AI Engineering Projects",
      "Backend Architecture",
      "Distributed Systems",
      "AI Agents",
      "Microservices",
      "Node.js",
      "TypeScript",
      "Python",
      "DevOps",
      "Cloud Infrastructure",
      "System Design",
    ],

    authors: [
      {
        name: siteConfig.fullName,
        url: absoluteUrl(`/${locale}/about`),
      },
    ],

    creator: siteConfig.fullName,
    publisher: siteConfig.fullName,
    category: "Software Engineering",

    alternates: {
      canonical: pagePath,
      languages: getLanguageAlternates(),
    },

    openGraph: {
      type: "website",
      url: pageUrl,
      title: pageMetadata.title,
      description: pageMetadata.description,
      siteName: siteConfig.name,
      locale: getOpenGraphLocale(locale),

      alternateLocale: routing.locales
        .filter((supportedLocale) => supportedLocale !== locale)
        .map(getOpenGraphLocale),
    },

    twitter: {
      card: "summary_large_image",
      title: pageMetadata.title,
      description: pageMetadata.description,
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

export default async function EngineeringPage({
  params,
}: EngineeringPageProps) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const articles = await getArticles(locale as AppLocale)

  const pageUrl = absoluteUrl(`/${locale}/articles`)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",

    name: `${pageMetadata.title} | ${siteConfig.name}`,
    description: pageMetadata.description,
    url: pageUrl,
    inLanguage: locale,

    author: {
      "@type": "Person",
      name: siteConfig.fullName,
      url: absoluteUrl(`/${locale}/about`),
    },

    mainEntity: {
      "@type": "ItemList",
      numberOfItems: articles.length,

      itemListElement: articles.map((article, index) => {
        const articlePath = createArticleUrl(locale, article.slug)

        const articleUrl = absoluteUrl(articlePath)

        return {
          "@type": "ListItem",
          position: index + 1,
          url: articleUrl,

          item: {
            "@type": "TechArticle",

            name: article.metadata.title,

            headline: article.metadata.title,

            description: article.metadata.description,

            url: articleUrl,

            image: absoluteUrl(article.metadata.coverImage),

            genre: article.metadata.category,

            keywords: [
              ...article.metadata.tags,
              ...article.metadata.stack,
            ].join(", "),

            datePublished: `${article.metadata.publishedAt}T00:00:00.000Z`,

            dateModified: `${getArticleDate(article)}T00:00:00.000Z`,

            author: {
              "@type": "Person",
              name: siteConfig.fullName,
            },
          },
        }
      }),
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

      <main className="min-h-screen">
        <section
          id="all-projects"
          aria-labelledby="engineering-heading"
          className="py-16 lg:py-24"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <header className="max-w-3xl">
              <p className="mb-3 text-sm font-medium tracking-widest text-accent-foreground uppercase">
                Engineering
              </p>

              <h1
                id="engineering-heading"
                className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
              >
                Systems, products, and architectures built for real-world use.
              </h1>

              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Explore a selection of AI platforms, backend systems, automation
                workflows, cloud infrastructure, and product experiences I
                designed with maintainability, scalability, and production
                readiness in mind.
              </p>
            </header>

            {articles.length > 0 ? (
              <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => {
                  const { metadata, slug } = article

                  const articleHref = createArticleUrl(locale, slug)

                  const formattedDate = new Intl.DateTimeFormat(locale, {
                    dateStyle: "medium",
                  }).format(new Date(`${metadata.publishedAt}T00:00:00.000Z`))

                  return (
                    <Link
                      key={slug}
                      href={articleHref}
                      aria-label={`Read ${metadata.title}`}
                      className="group block rounded-3xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background focus-visible:outline-none"
                    >
                      <Card className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-foreground/2 p-0 transition duration-300 group-hover:-translate-y-1 group-hover:border-foreground/20 group-hover:bg-foreground/4">
                        <div className="relative aspect-1200/630 overflow-hidden border-b border-border bg-muted">
                          <Image
                            src={metadata.coverImage}
                            alt={metadata.coverImageAlt}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        </div>

                        <div className="flex flex-1 flex-col p-6">
                          <p className="text-sm font-medium text-accent-foreground">
                            {metadata.category}
                          </p>

                          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                            {metadata.title}
                          </h2>

                          <p className="mt-4 leading-7 text-muted-foreground">
                            {metadata.description}
                          </p>

                          {metadata.stack.length > 0 && (
                            <div
                              className="mt-6 flex flex-wrap gap-2"
                              aria-label={`Technologies used in ${metadata.title}`}
                            >
                              {metadata.stack.slice(0, 5).map((technology) => (
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
                              dateTime={metadata.publishedAt}
                              className="text-xs text-muted-foreground"
                            >
                              {formattedDate}
                            </time>

                            <span className="inline-flex items-center text-sm font-medium text-accent-foreground">
                              View case study
                              <ArrowRight
                                className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
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
                  No published articles yet
                </h2>

                <p className="mt-3 text-muted-foreground">
                  Published engineering case studies will appear here.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
