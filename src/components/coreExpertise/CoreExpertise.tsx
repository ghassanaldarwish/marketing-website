import type { LucideIcon } from "lucide-react"
import { Brain, Cloud, Code2, Server } from "lucide-react"
import { useTranslations } from "next-intl"

import { Badge } from "../ui/badge"
import { Card } from "../ui/card"

type ExpertiseId =
  "aiEngineering" | "backendEngineering" | "cloudDevOps" | "modernFrontend"

type ExpertiseItem = {
  id: ExpertiseId
  title: string
  description: string
  points: string[]
}

const expertiseIcons: Record<ExpertiseId, LucideIcon> = {
  aiEngineering: Brain,
  backendEngineering: Server,
  cloudDevOps: Cloud,
  modernFrontend: Code2,
}

export default function CoreExpertise() {
  const t = useTranslations("home.coreExpertise")

  const expertise = t.raw("items") as ExpertiseItem[]

  return (
    <section className="border-y bg-foreground/2 py-12 lg:py-24">
      <div
        className="mx-auto max-w-6xl px-4 sm:px-6"
        data-layout-container="core-expertise"
      >
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

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {expertise.map((item) => {
            const Icon = expertiseIcons[item.id]

            return (
              <Card
                key={item.id}
                className="group p-6 transition hover:-translate-y-1 hover:bg-foreground/5"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border bg-accent-foreground/10 text-accent-foreground">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="text-2xl font-semibold">{item.title}</h3>

                <p className="mt-4 leading-7 text-muted-foreground">
                  {item.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {item.points.map((point) => (
                    <Badge
                      key={point}
                      variant="outline"
                      className="px-3 py-1 text-xs text-muted-foreground"
                    >
                      {point}
                    </Badge>
                  ))}
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
