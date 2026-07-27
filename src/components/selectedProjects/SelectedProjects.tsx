import { ArrowRight } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"

import { getArticles, type AppLocale } from "@/features/articles/server"
import { Link } from "@/i18n/routing"
import { selectFeaturedArticles } from "@/lib/mdx/select-featured-articles"

import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default async function SelectedProjects() {
  const locale = (await getLocale()) as AppLocale

  const [t, articles] = await Promise.all([
    getTranslations({
      locale,
      namespace: "home.selectedProjects",
    }),
    getArticles(locale),
  ])

  const selectedArticles = selectFeaturedArticles(articles)

  if (selectedArticles.length === 0) {
    return null
  }

  return (
    <section
      id="projects"
      aria-labelledby="selected-projects-heading"
      className="relative border-y py-12 lg:py-24"
    >
      <div
        className="mx-auto max-w-6xl px-4 sm:px-6"
        data-layout-container="selected-projects"
      >
        <header className="max-w-3xl">
          <p className="mb-3 text-sm font-medium tracking-widest text-accent-foreground uppercase">
            {t("eyebrow")}
          </p>

          <h2
            id="selected-projects-heading"
            className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl"
          >
            {t("title")}
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            {t("description")}
          </p>
        </header>

        <div className="mt-12 space-y-8">
          {selectedArticles.map((article) => {
            const { slug, metadata } = article
            const articleHref = `/articles/${slug}` as const
            const challenge = metadata.challenge ?? metadata.description

            return (
              <article
                key={slug}
                className="rounded-3xl border border-border bg-background/70 p-6 transition-colors hover:border-foreground/20 sm:p-8"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-medium text-accent-foreground">
                    {metadata.category}
                  </p>

                  <Badge variant="secondary">{metadata.status}</Badge>
                </div>

                <h3 className="mt-3 text-3xl font-semibold tracking-tight text-balance">
                  <Link
                    href={articleHref}
                    className="rounded-sm outline-none hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4"
                  >
                    {metadata.title}
                  </Link>
                </h3>

                <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
                  {metadata.description}
                </p>

                <Alert className="mt-6 bg-foreground/2 p-4 sm:p-5">
                  <h4 className="font-medium">{t("challengeTitle")}</h4>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {challenge}
                  </p>
                </Alert>

                {metadata.stack.length > 0 && (
                  <div
                    className="mt-6 flex flex-wrap gap-2"
                    aria-label={t("technologiesLabel", {
                      title: metadata.title,
                    })}
                  >
                    {metadata.stack.map((technology) => (
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

                <Button className="mt-6" variant="outline" asChild>
                  <Link href={articleHref}>
                    {t("readCaseStudy")}

                    <ArrowRight
                      aria-hidden="true"
                      className="ms-2 h-4 w-4 rtl:rotate-180"
                    />
                  </Link>
                </Button>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
