import type { LucideIcon } from "lucide-react"
import {
  ArrowRight,
  Brain,
  Cloud,
  Code2,
  Database,
  GitBranch,
  Server,
} from "lucide-react"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/routing"

import { Alert } from "../ui/alert"
import { Button } from "../ui/button"
import { Card } from "../ui/card"

type ArchitectureLayerId =
  | "clientApp"
  | "apiLayer"
  | "aiAgent"
  | "vectorDatabase"
  | "services"
  | "cloudDeploy"

type ArchitectureLayer = {
  id: ArchitectureLayerId
  label: string
}

const architectureIcons: Record<ArchitectureLayerId, LucideIcon> = {
  clientApp: Code2,
  apiLayer: GitBranch,
  aiAgent: Brain,
  vectorDatabase: Database,
  services: Server,
  cloudDeploy: Cloud,
}

export default function ArchitectureShowcase() {
  const t = useTranslations("home.architectureShowcase")

  const layers = t.raw("layers") as ArchitectureLayer[]

  return (
    <section className="border-y bg-foreground/2 py-12 lg:py-24">
      <div
        className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center"
        data-layout-container="architecture-showcase"
      >
        <div>
          <p className="mb-3 text-sm font-medium tracking-widest text-accent-foreground uppercase">
            {t("eyebrow")}
          </p>

          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            {t("title")}
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            {t("description")}
          </p>

          <Button className="mt-8" asChild>
            <Link href="/articles">
              {t("button")}
              <ArrowRight className="ms-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <Card className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {layers.map((layer) => {
              const Icon = architectureIcons[layer.id]

              return (
                <Alert key={layer.id} className="bg-accent-foreground/1 p-8">
                  <Icon className="mb-4 h-6 w-6 text-accent-foreground" />

                  <p className="font-medium">{layer.label}</p>
                </Alert>
              )
            })}
          </div>
        </Card>
      </div>
    </section>
  )
}
