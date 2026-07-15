import type { Metadata } from "next"

import { GraduationCap, Layers3 } from "lucide-react"
import { notFound } from "next/navigation"
import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { createStaticLanguageAlternates } from "@/i18n/alternates"
import { routing } from "@/i18n/routing"
import { absoluteUrl, getOpenGraphLocale, siteConfig } from "@/lib/config/site"

type AboutPageProps = {
  params: Promise<{
    locale: string
  }>
}

type AboutStructuredData = {
  pageName: string
  personDescription: string
  jobTitles: string[]
  knowsAbout: string[]
  educationName: string
}

type AboutTimelineItem = {
  id: string
  stage: string
  title: string
  description: string
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const t = await getTranslations({
    locale,
    namespace: "about.metadata",
  })

  const title = t("title")
  const description = t("description")
  const keywords = t.raw("keywords") as string[]

  const pageUrl = absoluteUrl(`/${locale}/about`)

  return {
    title,
    description,
    keywords,

    alternates: {
      canonical: pageUrl,
      languages: createStaticLanguageAlternates("/about"),
    },

    openGraph: {
      type: "profile",
      url: pageUrl,
      title,
      description,
      siteName: siteConfig.name,
      locale: getOpenGraphLocale(locale),

      alternateLocale: routing.locales
        .filter((supportedLocale) => supportedLocale !== locale)
        .map(getOpenGraphLocale),

      firstName: "Ghassan",
      lastName: "Aldarwish",
      username: "ghassanaldarwish",
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

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const [metadata, intro, journey] = await Promise.all([
    getTranslations({
      locale,
      namespace: "about.metadata",
    }),
    getTranslations({
      locale,
      namespace: "about.intro",
    }),
    getTranslations({
      locale,
      namespace: "about.journey",
    }),
  ])

  const structuredData = metadata.raw("structuredData") as AboutStructuredData

  const introParagraphs = intro.raw("paragraphs") as string[]
  const timeline = journey.raw("timeline") as AboutTimelineItem[]

  const siteUrl = siteConfig.url.toString()
  const pageUrl = absoluteUrl(`/${locale}/about`)

  const websiteId = `${siteUrl}#website`
  const personId = `${siteUrl}#person`
  const profilePageId = `${pageUrl}#webpage`

  const jsonLd = {
    "@context": "https://schema.org",

    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": profilePageId,

        name: structuredData.pageName,
        description: metadata("description"),
        url: pageUrl,
        inLanguage: locale,

        isPartOf: {
          "@id": websiteId,
        },

        mainEntity: {
          "@id": personId,
        },
      },

      {
        "@type": "Person",
        "@id": personId,

        name: siteConfig.fullName,
        alternateName: siteConfig.handle,

        url: pageUrl,

        mainEntityOfPage: {
          "@id": profilePageId,
        },

        image: {
          "@type": "ImageObject",
          url: absoluteUrl(siteConfig.profileImage),
        },

        jobTitle: structuredData.jobTitles,
        description: structuredData.personDescription,
        knowsAbout: structuredData.knowsAbout,

        alumniOf: {
          "@type": "EducationalOrganization",
          name: structuredData.educationName,
        },

        address: {
          "@type": "PostalAddress",
          addressCountry: "DE",
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
        <section className="py-12 lg:py-24">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="mb-3 text-sm font-medium tracking-widest text-accent-foreground uppercase">
                {intro("eyebrow")}
              </p>

              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                {intro("title")}
              </h1>
            </div>

            <div className="space-y-6 text-lg leading-8 text-muted-foreground">
              {introParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-foreground/2 py-12 lg:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-3xl">
              <p className="mb-3 text-sm font-medium tracking-widest text-accent-foreground uppercase">
                {journey("eyebrow")}
              </p>

              <h2 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                {journey("title")}
              </h2>

              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                {journey("description")}
              </p>
            </div>

            <div className="mt-12 space-y-6">
              {timeline.map((item, index) => (
                <article
                  key={item.id}
                  className="grid gap-6 rounded-3xl border border-border bg-background/70 p-6 md:grid-cols-[180px_1fr]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-foreground/2 text-accent-foreground">
                      {index === 0 ? (
                        <GraduationCap className="h-6 w-6" aria-hidden="true" />
                      ) : (
                        <Layers3 className="h-6 w-6" aria-hidden="true" />
                      )}
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        {journey("stageLabel")}
                      </p>

                      <p className="font-semibold">{item.stage}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-semibold">{item.title}</h3>

                    <p className="mt-3 leading-7 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
