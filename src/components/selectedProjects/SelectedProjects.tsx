import { ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/routing"

import { Alert } from "../ui/alert"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"

type Project = {
  id: string
  title: string
  category: string
  description: string
  problem: string
  stack: string[]
}

export default function SelectedProjects() {
  const t = useTranslations("home.selectedProjects")

  const projects = t.raw("projects") as Project[]

  return (
    <section id="projects" className="relative border-y py-12 lg:py-24">
      <div className="mx-auto max-w-6xl px-2 lg:px-0">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-medium tracking-widest text-accent-foreground uppercase">
            {t("eyebrow")}
          </p>

          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            {t("title")}
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            {t("description")}
          </p>
        </div>

        <div className="mt-12 space-y-8">
          {projects.map((project) => (
            <article
              key={project.id}
              className="rounded-3xl border bg-background/70 p-6"
            >
              <p className="text-sm font-medium text-accent-foreground">
                {project.category}
              </p>

              <h3 className="mt-3 text-3xl font-semibold">{project.title}</h3>

              <p className="mt-4 leading-7 text-muted-foreground">
                {project.description}
              </p>

              <Alert className="mt-6 bg-foreground/1 p-4">
                <h4 className="font-medium">{t("challengeTitle")}</h4>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {project.problem}
                </p>
              </Alert>

              <div className="mt-6 flex flex-wrap gap-2">
                {project.stack.map((technology) => (
                  <Badge
                    key={technology}
                    variant="outline"
                    className="px-3 py-1 text-xs text-muted-foreground"
                  >
                    {technology}
                  </Badge>
                ))}
              </div>

              <Button className="mt-6" variant="outline" asChild>
                <Link href="/articles">
                  {t("readCaseStudy")}
                  <ArrowRight className="ms-2 h-4 w-4" />
                </Link>
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
