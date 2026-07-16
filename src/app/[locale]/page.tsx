import type { Metadata } from "next"

import { notFound } from "next/navigation"
import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"

import ArchitectureShowcase from "@/components/architectureShowcase/ArchitectureShowcase"
import CoreExpertise from "@/components/coreExpertise/CoreExpertise"
import EngineeringBeyondCode from "@/components/engineeringBeyondCode/EngineeringBeyondCode"
import FinalCTA from "@/components/finalCTA/FinalCTA"
import Hero from "@/components/hero/Hero"
import SelectedProjects from "@/components/selectedProjects/SelectedProjects"
import Technologies from "@/components/technologies/Technologies"
import GridBackground from "@/components/ui/GridBackground"

import { createStaticLanguageAlternates } from "@/i18n/alternates"
import { routing } from "@/i18n/routing"
import { absoluteUrl, getOpenGraphLocale, siteConfig } from "@/lib/config/site"

type HomePageProps = {
  params: Promise<{
    locale: string
  }>
}

type HomeStructuredData = {
  personDescription: string
  jobTitles: string[]
  knowsAbout: string[]
  pages: {
    engineering: string
    contact: string
  }
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const t = await getTranslations({
    locale,
    namespace: "home.metadata",
  })

  const title = t("title")
  const description = t("description")
  const keywords = t.raw("keywords") as string[]

  const pageUrl = absoluteUrl(`/${locale}`)

  return {
    /**
     * Prevent the parent layout template from producing:
     *
     * Ghassan — Backend Developer, DevOps Engineer & Junior AI Developer | Ghassan
     */
    title: {
      absolute: title,
    },

    description,
    keywords,

    alternates: {
      canonical: pageUrl,
      languages: createStaticLanguageAlternates(),
    },

    /**
     * Images are supplied automatically by:
     *
     * app/[locale]/opengraph-image.tsx
     * app/[locale]/twitter-image.tsx
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

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  /**
   * Makes the locale available to next-intl and supports
   * static rendering for localized routes.
   */
  setRequestLocale(locale)

  const t = await getTranslations({
    locale,
    namespace: "home.metadata",
  })

  const structuredData = t.raw("structuredData") as HomeStructuredData

  const title = t("title")
  const description = t("description")

  const siteUrl = siteConfig.url.toString()

  const homeUrl = absoluteUrl(`/${locale}`)
  const aboutUrl = absoluteUrl(`/${locale}/about`)
  const engineeringUrl = absoluteUrl(`/${locale}/articles`)
  const contactUrl = absoluteUrl(`/${locale}/contact`)

  /**
   * WebSite and Person IDs remain identical across languages.
   * Only the localized WebPage ID changes.
   */
  const websiteId = `${siteUrl}#website`
  const personId = `${siteUrl}#person`
  const webpageId = `${homeUrl}#webpage`

  const jsonLd = {
    "@context": "https://schema.org",

    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteId,

        name: siteConfig.name,
        alternateName: siteConfig.fullName,

        url: siteUrl,
        description,

        inLanguage: locale,

        publisher: {
          "@id": personId,
        },
      },

      {
        "@type": "WebPage",
        "@id": webpageId,

        url: homeUrl,
        name: title,
        description,

        isPartOf: {
          "@id": websiteId,
        },

        about: {
          "@id": personId,
        },

        primaryImageOfPage: {
          "@type": "ImageObject",
          url: absoluteUrl(siteConfig.defaultSocialImage),
          width: 1200,
          height: 630,
        },

        inLanguage: locale,
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

        subjectOf: [
          {
            "@type": "CollectionPage",
            name: structuredData.pages.engineering,
            url: engineeringUrl,
          },
          {
            "@type": "ContactPage",
            name: structuredData.pages.contact,
            url: contactUrl,
          },
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

      <main className="relative">
        <div className="relative">
          <GridBackground />

          <Hero />

          <Technologies />

          <EngineeringBeyondCode />
        </div>

        <CoreExpertise />

        <SelectedProjects />

        <ArchitectureShowcase />

        <FinalCTA />
      </main>
    </>
  )
}
