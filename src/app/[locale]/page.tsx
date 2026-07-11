import type { Metadata } from "next"

import { notFound } from "next/navigation"
import { hasLocale } from "next-intl"
import { setRequestLocale } from "next-intl/server"

import ArchitectureShowcase from "@/components/architectureShowcase/ArchitectureShowcase"
import CoreExpertise from "@/components/coreExpertise/CoreExpertise"
import EngineeringBeyondCode from "@/components/engineeringBeyondCode/EngineeringBeyondCode"
import FinalCTA from "@/components/finalCTA/FinalCTA"
import Hero from "@/components/hero/Hero"
import SelectedProjects from "@/components/selectedProjects/SelectedProjects"
import Technologies from "@/components/technologies/Technologies"
import GridBackground from "@/components/ui/GridBackground"

import { routing } from "@/i18n/routing"
import {
  absoluteUrl,
  getOpenGraphLocale,
  isProductionDeployment,
  siteConfig,
} from "@/lib/site"

type HomePageProps = {
  params: Promise<{
    locale: string
  }>
}

const homeMetadata = {
  title: "Ghassan — AI Engineer & Backend Engineer",

  description:
    "Ghassan Aldarwish is an AI Engineer and Backend Engineer building production AI systems, scalable backend platforms, distributed architectures, automation workflows and cloud-native applications.",

  headline: "Building intelligent systems that scale.",

  shortDescription:
    "Production AI systems, scalable backend architecture and cloud-native software.",
}

function getLanguageAlternates(): Record<string, string> {
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((locale) => [locale, `/${locale}`])
  )

  languages["x-default"] = `/${routing.defaultLocale}`

  return languages
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const pagePath = `/${locale}`
  const pageUrl = absoluteUrl(pagePath)

  return {
    /**
     * Prevents the parent template from generating:
     * Ghassan — AI Engineer & Backend Engineer | Ghassan
     */
    title: {
      absolute: homeMetadata.title,
    },

    description: homeMetadata.description,

    keywords: [
      "Ghassan Aldarwish",
      "AI Engineer",
      "Backend Engineer",
      "Senior Software Engineer",
      "Software Engineer Germany",
      "AI Engineer Germany",
      "Backend Engineer Germany",
      "Production AI Systems",
      "AI Agents",
      "Large Language Models",
      "RAG Systems",
      "Model Context Protocol",
      "MCP Servers",
      "Node.js",
      "TypeScript",
      "Python",
      "FastAPI",
      "Microservices",
      "Distributed Systems",
      "Software Architecture",
      "Docker",
      "Kubernetes",
      "DevOps",
      "Cloud Engineering",
    ],

    authors: [
      {
        name: siteConfig.fullName,
        url: absoluteUrl(`/${locale}/about`),
      },
    ],

    creator: siteConfig.fullName,
    publisher: siteConfig.fullName,

    applicationName: siteConfig.name,
    category: "Technology",

    alternates: {
      canonical: pagePath,
      languages: getLanguageAlternates(),
    },

    openGraph: {
      type: "website",
      url: pageUrl,

      title: homeMetadata.title,
      description: homeMetadata.description,

      siteName: siteConfig.name,
      locale: getOpenGraphLocale(locale),

      alternateLocale: routing.locales
        .filter((supportedLocale) => supportedLocale !== locale)
        .map(getOpenGraphLocale),
    },

    twitter: {
      card: "summary_large_image",

      title: homeMetadata.title,
      description: homeMetadata.description,

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

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const homeUrl = absoluteUrl(`/${locale}`)
  const aboutUrl = absoluteUrl(`/${locale}/about`)
  const engineeringUrl = absoluteUrl(`/${locale}/engineering`)
  const contactUrl = absoluteUrl(`/${locale}/contact`)

  const jsonLd = {
    "@context": "https://schema.org",

    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url.toString()}#website`,

        name: siteConfig.name,
        alternateName: siteConfig.fullName,

        url: siteConfig.url.toString(),
        description: homeMetadata.description,

        inLanguage: locale,

        publisher: {
          "@id": `${aboutUrl}#person`,
        },
      },

      {
        "@type": "WebPage",
        "@id": `${homeUrl}#webpage`,

        url: homeUrl,
        name: homeMetadata.title,
        description: homeMetadata.description,

        isPartOf: {
          "@id": `${siteConfig.url.toString()}#website`,
        },

        about: {
          "@id": `${aboutUrl}#person`,
        },

        primaryImageOfPage: {
          "@type": "ImageObject",
          url: absoluteUrl(siteConfig.defaultSocialImage),
        },

        inLanguage: locale,
      },

      {
        "@type": "Person",
        "@id": `${aboutUrl}#person`,

        name: siteConfig.fullName,
        alternateName: "@ghassanaldarwish",

        url: aboutUrl,
        mainEntityOfPage: aboutUrl,

        image: absoluteUrl(siteConfig.defaultSocialImage),

        jobTitle: ["AI Engineer", "Backend Engineer", "Software Engineer"],

        description:
          "AI Engineer and Backend Engineer focused on production AI systems, distributed backend architecture, cloud infrastructure, DevOps and modern web development.",

        knowsAbout: [
          "Artificial Intelligence",
          "Large Language Models",
          "AI Agents",
          "Retrieval-Augmented Generation",
          "Model Context Protocol",
          "Backend Engineering",
          "Distributed Systems",
          "Microservices",
          "Node.js",
          "TypeScript",
          "Python",
          "FastAPI",
          "PostgreSQL",
          "Redis",
          "Docker",
          "Kubernetes",
          "CI/CD",
          "Cloud Infrastructure",
          "Next.js",
          "React",
        ],

        address: {
          "@type": "PostalAddress",
          addressCountry: "DE",
        },

        sameAs: [
          "https://www.linkedin.com/in/ghassanaldarwish",
          "https://github.com/ghassanaldarwish",
        ],

        subjectOf: [
          {
            "@type": "CollectionPage",
            name: "Engineering",
            url: engineeringUrl,
          },
          {
            "@type": "ContactPage",
            name: "Contact",
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
