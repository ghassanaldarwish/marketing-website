import type { Metadata } from "next"
import type { LucideIcon } from "lucide-react"

import {
  ArrowRight,
  Brain,
  Cloud,
  Code2,
  Layers3,
  Server,
  Workflow,
} from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { hasLocale } from "next-intl"
import { setRequestLocale } from "next-intl/server"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { routing } from "@/i18n/routing"
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

type Project = {
  title: string
  slug: string
  category: string
  status: string
  icon: LucideIcon
  description: string
  challenge: string
  solution: string
  outcome: string
  stack: string[]
  layers: string[]
  featured?: boolean
  githubHref?: string
  liveHref?: string
}

const pageMetadata = {
  title: "Engineering",
  description:
    "Explore software systems, AI platforms, backend architectures, automation workflows and cloud infrastructure designed by Ghassan Aldarwish.",
}

const projects: Project[] = [
  {
    title: "AI Trading Assistant",
    slug: "ai-trading-assistant",
    category: "AI Engineering / Backend",
    status: "Case Study",
    icon: Brain,
    featured: true,
    description:
      "An AI-powered analysis platform that combines language models, structured workflows, backend APIs, and data processing to support intelligent decision-making.",
    challenge:
      "The main challenge was connecting AI reasoning with reliable backend services while keeping the system explainable, maintainable, and production-ready.",
    solution:
      "Designed a layered architecture with AI orchestration, backend APIs, data persistence, workflow execution, and clear boundaries between reasoning and business logic.",
    outcome:
      "A system architecture that can support AI-assisted analysis, tool usage, structured outputs, and future integration with real-time data sources.",
    stack: [
      "Python",
      "TypeScript",
      "OpenAI",
      "LangChain",
      "PostgreSQL",
      "Docker",
    ],
    layers: [
      "AI Layer",
      "Workflow Engine",
      "Backend API",
      "Data Layer",
      "Deployment",
    ],
  },
  {
    title: "Scalable Backend Platform",
    slug: "scalable-backend-platform",
    category: "Backend Architecture",
    status: "System Design",
    icon: Server,
    featured: true,
    description:
      "A distributed backend platform designed around microservices, authentication, API boundaries, background jobs, service communication, and deployment workflows.",
    challenge:
      "The goal was to keep services maintainable while supporting independent deployments, predictable scaling, and clean communication between domains.",
    solution:
      "Built the architecture around clear service ownership, typed APIs, reusable infrastructure patterns, Docker-based environments, and CI/CD automation.",
    outcome:
      "A backend foundation that supports growth, separation of concerns, better deployment control, and easier long-term maintenance.",
    stack: ["Node.js", "TypeScript", "GraphQL", "Redis", "Docker", "CI/CD"],
    layers: [
      "API Gateway",
      "Auth Service",
      "Domain Services",
      "Cache",
      "CI/CD",
    ],
  },
  {
    title: "AI Workflow Automation",
    slug: "ai-workflow-automation",
    category: "AI Agents / Automation",
    status: "Architecture",
    icon: Workflow,
    featured: true,
    description:
      "Automation pipelines that connect APIs, AI agents, backend services, and external tools to reduce manual work and improve engineering productivity.",
    challenge:
      "AI workflows must be useful, repeatable, observable, and safe enough for real-world usage instead of being simple one-time prompts.",
    solution:
      "Designed workflow steps with tool boundaries, structured prompts, local model support, logging, retries, and integration points for backend services.",
    outcome:
      "A reusable automation architecture for research, content generation, engineering support, and operational tasks.",
    stack: ["Python", "AI Agents", "MCP", "Ollama", "Docker", "Linux"],
    layers: ["Agent", "Tools", "Memory", "APIs", "Automation"],
  },
  {
    title: "Developer Workspace Platform",
    slug: "developer-workspace-platform",
    category: "Full-Stack / Cloud",
    status: "Product System",
    icon: Layers3,
    description:
      "A platform concept for managing developer workspaces, user flows, backend services, authentication, infrastructure, and production deployment.",
    challenge:
      "The system needed to combine product experience with backend reliability, secure access, deployment automation, and clear service boundaries.",
    solution:
      "Structured the application with a Next.js frontend, backend APIs, service-based architecture, Docker deployment, and infrastructure automation.",
    outcome:
      "A product-oriented system design that connects frontend experience, backend services, and DevOps workflows into one maintainable platform.",
    stack: ["Next.js", "Node.js", "TypeScript", "Docker", "Traefik", "Linux"],
    layers: [
      "Frontend",
      "Authentication",
      "APIs",
      "Services",
      "Infrastructure",
    ],
  },
  {
    title: "Cloud Deployment Pipeline",
    slug: "cloud-deployment-pipeline",
    category: "DevOps / Infrastructure",
    status: "Engineering System",
    icon: Cloud,
    description:
      "A deployment workflow focused on repeatable infrastructure setup, Dockerized services, reverse proxy routing, TLS, and production automation.",
    challenge:
      "Manual deployments create risk, inconsistency, and slow feedback. The goal was to make production updates more predictable.",
    solution:
      "Used infrastructure automation, Docker Compose, reverse proxy configuration, Git-based deployment, and service restart workflows.",
    outcome:
      "A cleaner production workflow that supports faster updates, easier rollback thinking, and better operational control.",
    stack: ["Docker", "Linux", "Traefik", "Ansible", "GitHub Actions", "TLS"],
    layers: ["Server", "Proxy", "Containers", "Automation", "Monitoring"],
  },
  {
    title: "Portfolio Marketing Website",
    slug: "portfolio-marketing-website",
    category: "Frontend / Personal Brand",
    status: "Production Website",
    icon: Code2,
    description:
      "A modern portfolio and marketing website designed to communicate engineering expertise, technical depth, and professional positioning.",
    challenge:
      "The website needed to feel polished, credible, technical, and focused on AI engineering, backend systems, and software architecture.",
    solution:
      "Designed a section-based layout using Next.js, Tailwind CSS, shadcn/ui, strong typography, dark glass styling, and clear content hierarchy.",
    outcome:
      "A production-ready personal website structure that supports projects, articles, engineering pages, contact flows, and professional positioning.",
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "shadcn/ui"],
    layers: ["Brand", "Content", "UI", "SEO", "Conversion"],
  },
]

function getLanguageAlternates(): Record<string, string> {
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((locale) => [locale, `/${locale}/engineering`])
  )

  languages["x-default"] = `/${routing.defaultLocale}/engineering`

  return languages
}

export async function generateMetadata({
  params,
}: EngineeringPageProps): Promise<Metadata> {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const pagePath = `/${locale}/engineering`
  const pageUrl = absoluteUrl(pagePath)

  return {
    /**
     * The parent layout adds "| Ghassan".
     */
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

  const pageUrl = absoluteUrl(`/${locale}/engineering`)

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
      numberOfItems: projects.length,

      itemListElement: projects.map((project, index) => {
        const projectUrl = absoluteUrl(`/${locale}/articles/${project.slug}`)

        return {
          "@type": "ListItem",
          position: index + 1,
          url: projectUrl,

          item: {
            "@type": "CreativeWork",
            name: project.title,
            description: project.description,
            url: projectUrl,
            genre: project.category,
            keywords: project.stack.join(", "),

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

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => {
                const Icon = project.icon

                /**
                 * Your project details are currently MDX
                 * articles.
                 */
                const projectHref = `/${locale}/articles/${project.slug}`

                return (
                  <Link
                    key={project.slug}
                    href={projectHref}
                    aria-label={`View details about ${project.title}`}
                    className="group block rounded-3xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background focus-visible:outline-none"
                  >
                    <Card className="flex h-full flex-col rounded-3xl border border-border bg-foreground/2 p-6 transition duration-300 group-hover:-translate-y-1 group-hover:border-foreground/20 group-hover:bg-foreground/4">
                      <div className="mb-6 flex items-start justify-between gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-accent-foreground/5 text-accent-foreground">
                          <Icon className="h-6 w-6" aria-hidden="true" />
                        </div>

                        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                          {project.status}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-accent-foreground">
                        {project.category}
                      </p>

                      <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                        {project.title}
                      </h2>

                      <p className="mt-4 leading-7 text-muted-foreground">
                        {project.description}
                      </p>

                      <div
                        className="mt-6 flex flex-wrap gap-2"
                        aria-label={`Technologies used in ${project.title}`}
                      >
                        {project.stack.slice(0, 5).map((technology) => (
                          <Badge
                            key={technology}
                            variant="outline"
                            className="px-3 py-1 text-xs text-muted-foreground"
                          >
                            {technology}
                          </Badge>
                        ))}
                      </div>

                      <div className="mt-auto pt-8">
                        <span className="inline-flex items-center text-sm font-medium text-accent-foreground">
                          View case study
                          <ArrowRight
                            className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
