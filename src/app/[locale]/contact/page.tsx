import type { Metadata } from "next"

import { ExternalLink } from "lucide-react"
import { notFound } from "next/navigation"
import { hasLocale } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { ContactForm } from "@/features/contact/contact-form"
import { createStaticLanguageAlternates } from "@/i18n/alternates"
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
    title,
    description,
    keywords,
    alternates: {
      canonical: pageUrl,
      languages: createStaticLanguageAlternates("/contact"),
    },
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
    getTranslations({ locale, namespace: "contact.content" }),
    getTranslations({ locale, namespace: "contact.metadata" }),
  ])

  const structuredData = metadata.raw("structuredData") as ContactStructuredData
  const siteUrl = siteConfig.url.toString()
  const pageUrl = absoluteUrl(`/${locale}/contact`)
  const aboutUrl = absoluteUrl(`/${locale}/about`)
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
        isPartOf: { "@id": websiteId },
        about: { "@id": personId },
        mainEntity: { "@id": personId },
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

      <main className="relative min-h-screen overflow-x-clip px-4 sm:px-6 lg:px-0">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl min-w-0 flex-col justify-center gap-10 py-16 md:gap-14 lg:py-24">
          <header className="w-full min-w-0">
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

          <section
            aria-labelledby="contact-form-heading"
            className="w-full min-w-0"
          >
            <h2 id="contact-form-heading" className="sr-only">
              {content("formHeading")}
            </h2>
            <ContactForm submitLabel={content("sendMessage")} />

            <div className="mt-8 border-t border-border pt-6">
              <Button
                asChild
                variant="outline"
                className="min-h-11 w-full whitespace-normal sm:w-auto"
              >
                <a
                  href={siteConfig.socialLinks.linkedin}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  LinkedIn
                  <ExternalLink aria-hidden="true" />
                </a>
              </Button>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
