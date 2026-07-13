import type { Metadata } from "next"

import { notFound } from "next/navigation"
import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { ContactForm } from "@/components/contact/ContactForm"
import { Button } from "@/components/ui/button"

import { routing } from "@/i18n/routing"
import { absoluteUrl, getOpenGraphLocale, siteConfig } from "@/lib/config/site"

type ContactPageProps = {
  params: Promise<{
    locale: string
  }>
}

type ContactStructuredData = {
  pageName: string
  personDescription: string
  jobTitles: string[]
  knowsAbout: string[]
}

function getLanguageAlternates(): Record<string, string> {
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((locale) => [locale, absoluteUrl(`/${locale}/contact`)])
  )

  languages["x-default"] = absoluteUrl(`/${routing.defaultLocale}/contact`)

  return languages
}

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const t = await getTranslations({
    locale,
    namespace: "contact.metadata",
  })

  const title = t("title")
  const description = t("description")
  const keywords = t.raw("keywords") as string[]

  const pageUrl = absoluteUrl(`/${locale}/contact`)

  return {
    /**
     * The locale layout applies:
     *
     * Contact | Ghassan
     */
    title,

    description,
    keywords,

    alternates: {
      canonical: pageUrl,
      languages: getLanguageAlternates(),
    },

    /**
     * Images are generated automatically by the metadata files
     * inside this route:
     *
     * app/[locale]/contact/opengraph-image.tsx
     * app/[locale]/contact/twitter-image.tsx
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

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const [content, metadata] = await Promise.all([
    getTranslations({
      locale,
      namespace: "contact.content",
    }),
    getTranslations({
      locale,
      namespace: "contact.metadata",
    }),
  ])

  const structuredData = metadata.raw("structuredData") as ContactStructuredData

  const siteUrl = siteConfig.url.toString()

  const pageUrl = absoluteUrl(`/${locale}/contact`)
  const aboutUrl = absoluteUrl(`/${locale}/about`)

  /**
   * These IDs remain stable across localized pages.
   */
  const websiteId = `${siteUrl}#website`
  const personId = `${siteUrl}#person`
  const contactPageId = `${pageUrl}#webpage`

  const jsonLd = {
    "@context": "https://schema.org",

    "@graph": [
      {
        "@type": "ContactPage",
        "@id": contactPageId,

        name: structuredData.pageName,
        description: metadata("description"),
        url: pageUrl,
        inLanguage: locale,

        isPartOf: {
          "@id": websiteId,
        },

        about: {
          "@id": personId,
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

        url: aboutUrl,

        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${aboutUrl}#webpage`,
          url: aboutUrl,
        },

        image: {
          "@type": "ImageObject",
          url: absoluteUrl(siteConfig.profileImage),
        },

        jobTitle: structuredData.jobTitles,
        description: structuredData.personDescription,
        knowsAbout: structuredData.knowsAbout,

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

      <main className="relative min-h-screen px-4 sm:px-6 lg:px-0">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl flex-col justify-center gap-10 py-16 md:gap-14 lg:py-24">
          <header className="w-full">
            <p className="mb-3 text-sm font-medium tracking-widest text-accent-foreground uppercase">
              {content("eyebrow")}
            </p>

            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {content("title")}
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              {content("description")}
            </p>
          </header>

          <section aria-labelledby="contact-form-heading" className="w-full">
            <h2 id="contact-form-heading" className="sr-only">
              {content("formHeading")}
            </h2>

            <ContactForm />

            <div className="mt-6 flex justify-end">
              <Button type="submit" form="contact-form" size="lg">
                {content("sendMessage")}
              </Button>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
