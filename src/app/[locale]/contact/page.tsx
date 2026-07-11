import type { Metadata } from "next"

import { notFound } from "next/navigation"
import { hasLocale } from "next-intl"
import { setRequestLocale } from "next-intl/server"

import { ContactForm } from "@/components/contact/ContactForm"
import { Button } from "@/components/ui/button"
import { routing } from "@/i18n/routing"
import {
  absoluteUrl,
  getOpenGraphLocale,
  isProductionDeployment,
  siteConfig,
} from "@/lib/site"

type ContactPageProps = {
  params: Promise<{
    locale: string
  }>
}

const contactPageMetadata = {
  title: "Contact",
  description:
    "Contact Ghassan Aldarwish about AI engineering, backend development, software architecture, consulting, collaboration, or job opportunities in Germany.",
}

function getLanguageAlternates(): Record<string, string> {
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((locale) => [locale, `/${locale}/contact`])
  )

  languages["x-default"] = `/${routing.defaultLocale}/contact`

  return languages
}

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const pagePath = `/${locale}/contact`
  const pageUrl = absoluteUrl(pagePath)

  return {
    /**
     * The parent layout adds:
     * | Ghassan
     */
    title: contactPageMetadata.title,

    description: contactPageMetadata.description,

    keywords: [
      "Contact Ghassan Aldarwish",
      "Hire AI Engineer",
      "Hire Backend Engineer",
      "Software Engineer Germany",
      "AI Engineering Consultant",
      "Backend Development",
      "Software Architecture",
      "Node.js Engineer",
      "TypeScript Engineer",
      "Python Engineer",
    ],

    authors: [
      {
        name: siteConfig.fullName,
        url: absoluteUrl(`/${locale}/about`),
      },
    ],

    creator: siteConfig.fullName,
    publisher: siteConfig.fullName,

    category: "Technology",

    alternates: {
      canonical: pagePath,
      languages: getLanguageAlternates(),
    },

    openGraph: {
      type: "website",
      url: pageUrl,

      title: contactPageMetadata.title,
      description: contactPageMetadata.description,

      siteName: siteConfig.name,
      locale: getOpenGraphLocale(locale),

      alternateLocale: routing.locales
        .filter((supportedLocale) => supportedLocale !== locale)
        .map(getOpenGraphLocale),
    },

    twitter: {
      card: "summary_large_image",

      title: contactPageMetadata.title,
      description: contactPageMetadata.description,

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

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const pageUrl = absoluteUrl(`/${locale}/contact`)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",

    name: `Contact ${siteConfig.fullName}`,
    description: contactPageMetadata.description,
    url: pageUrl,
    inLanguage: locale,

    mainEntity: {
      "@type": "Person",
      "@id": `${absoluteUrl(`/${locale}/about`)}#person`,

      name: siteConfig.fullName,
      alternateName: "@ghassanaldarwish",

      url: absoluteUrl(`/${locale}/about`),

      jobTitle: ["AI Engineer", "Backend Engineer", "Software Engineer"],

      knowsAbout: [
        "Artificial Intelligence",
        "AI Agents",
        "Large Language Models",
        "Backend Engineering",
        "Distributed Systems",
        "Microservices",
        "Node.js",
        "TypeScript",
        "Python",
        "Docker",
        "Kubernetes",
        "Software Architecture",
      ],
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

      <main className="relative min-h-screen px-4 sm:px-6 lg:px-0">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl flex-col justify-center gap-10 py-16 md:gap-14 lg:py-24">
          <header className="w-full">
            <p className="mb-3 text-sm font-medium tracking-widest text-accent-foreground uppercase">
              Contact
            </p>

            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Get in Touch
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              Have a project, job opportunity, or technical question? Send me a
              message and tell me how I can help.
            </p>
          </header>

          <section aria-labelledby="contact-form-heading" className="w-full">
            <h2 id="contact-form-heading" className="sr-only">
              Contact form
            </h2>

            <ContactForm />

            <div className="mt-6 flex justify-end">
              <Button type="submit" form="contact-form" size="lg">
                Send Message
              </Button>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
