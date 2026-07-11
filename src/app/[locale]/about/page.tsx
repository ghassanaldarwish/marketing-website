import type { Metadata } from "next"

import { GraduationCap, Layers3 } from "lucide-react"
import { notFound } from "next/navigation"
import { hasLocale } from "next-intl"
import { setRequestLocale } from "next-intl/server"

import { routing } from "@/i18n/routing"
import {
  absoluteUrl,
  getOpenGraphLocale,
  isProductionDeployment,
  siteConfig,
} from "@/lib/site"

type AboutPageProps = {
  params: Promise<{
    locale: string
  }>
}

const pageMetadata = {
  title: "About Me",
  description:
    "Learn about Ghassan Aldarwish, an AI Engineer and Backend Engineer with experience in production AI systems, distributed backend architecture, DevOps, cloud infrastructure and modern web development.",
}

const timeline = [
  {
    year: "Foundation",
    title: "Physics Background",
    description:
      "My academic background in Physics shaped the way I approach engineering: analytical thinking, problem decomposition, systems understanding, and curiosity about how complex things work.",
  },
  {
    year: "2017+",
    title: "Software Engineering",
    description:
      "I started building production software with a strong focus on backend development, APIs, databases, and scalable application architecture.",
  },
  {
    year: "Backend",
    title: "Distributed Systems & APIs",
    description:
      "Over the years, I worked deeply with Node.js, TypeScript, Python, REST APIs, GraphQL, gRPC, microservices, event-driven systems, and production backend platforms.",
  },
  {
    year: "DevOps",
    title: "Cloud, Containers & Automation",
    description:
      "I expanded into Docker, Kubernetes, Linux, CI/CD, infrastructure automation, and production deployment workflows to understand how software runs beyond the codebase.",
  },
  {
    year: "AI",
    title: "Production AI Engineering",
    description:
      "My recent focus is building AI systems with LLMs, AI agents, MCP servers, RAG pipelines, vector databases, OpenAI, Ollama, LangChain, Python, and TypeScript services.",
  },
] as const

function getLanguageAlternates(): Record<string, string> {
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((locale) => [locale, `/${locale}/about`])
  )

  languages["x-default"] = `/${routing.defaultLocale}/about`

  return languages
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const pagePath = `/${locale}/about`
  const pageUrl = absoluteUrl(pagePath)

  return {
    title: pageMetadata.title,
    description: pageMetadata.description,

    keywords: [
      "Ghassan Aldarwish",
      "AI Engineer",
      "Backend Engineer",
      "Software Engineer Germany",
      "Node.js Engineer",
      "TypeScript Engineer",
      "Python Engineer",
      "AI Systems",
      "Backend Architecture",
      "Distributed Systems",
      "DevOps Engineer",
      "Cloud Engineering",
    ],

    authors: [
      {
        name: siteConfig.fullName,
        url: pageUrl,
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
      type: "profile",
      url: pageUrl,

      title: pageMetadata.title,
      description: pageMetadata.description,

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

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const pageUrl = absoluteUrl(`/${locale}/about`)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",

    name: `${pageMetadata.title} | ${siteConfig.name}`,
    description: pageMetadata.description,
    url: pageUrl,
    inLanguage: locale,

    mainEntity: {
      "@type": "Person",
      "@id": `${pageUrl}#person`,

      name: siteConfig.fullName,
      alternateName: "@ghassanaldarwish",

      url: pageUrl,

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
        "Docker",
        "Kubernetes",
        "CI/CD",
        "Cloud Infrastructure",
        "Next.js",
        "React",
      ],

      alumniOf: {
        "@type": "EducationalOrganization",
        name: "Physics",
      },

      address: {
        "@type": "PostalAddress",
        addressCountry: "DE",
      },
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
        <section className="py-12 lg:py-24">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="mb-3 text-sm font-medium tracking-widest text-accent-foreground uppercase">
                Who I Am
              </p>

              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                An engineer focused on systems, not just code.
              </h1>
            </div>

            <div className="space-y-6 text-lg leading-8 text-muted-foreground">
              <p>
                My work sits at the intersection of AI engineering, backend
                systems, DevOps, and modern web development. I enjoy building
                software that is not only functional, but also scalable,
                reliable, observable, and maintainable.
              </p>

              <p>
                Most of my strongest work is behind the scenes: backend
                services, APIs, infrastructure, automation, AI workflows,
                deployment systems, and architecture decisions. These are not
                always visible in a user interface, but they are the foundation
                that makes serious software work.
              </p>

              <p>
                At the same time, I care about frontend quality. A strong
                product needs clean interfaces, good performance, thoughtful UX,
                and clear communication. That is why I also build polished React
                and Next.js experiences that reflect the quality of the systems
                behind them.
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-foreground/2 py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-3xl">
              <p className="mb-3 text-sm font-medium tracking-widest text-accent-foreground uppercase">
                Engineering Journey
              </p>

              <h2 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                From analytical thinking to production AI systems.
              </h2>

              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                My path combines scientific thinking, backend engineering, cloud
                infrastructure, and modern AI development.
              </p>
            </div>

            <div className="mt-12 space-y-6">
              {timeline.map((item, index) => (
                <article
                  key={item.title}
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
                      <p className="text-sm text-muted-foreground">Stage</p>

                      <p className="font-semibold">{item.year}</p>
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
