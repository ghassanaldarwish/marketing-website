import { useTranslations } from "next-intl"

import { Alert } from "../ui/alert"
import { Card } from "../ui/card"

type EngineeringLayer = {
  title: string
  description: string
}

export default function EngineeringBeyondCode() {
  const t = useTranslations("home.engineeringBeyondCode")

  const layers = t.raw("layers") as EngineeringLayer[]

  return (
    <section className="relative py-12 lg:py-24">
      <div
        className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center"
        data-layout-container="engineering-beyond-code"
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

          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            {t("secondaryDescription")}
          </p>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            {layers.map((layer, index) => (
              <div key={layer.title}>
                <Alert>
                  <h3 className="font-medium">{layer.title}</h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {layer.description}
                  </p>
                </Alert>

                {index < layers.length - 1 && (
                  <div className="mx-auto h-5 w-px bg-foreground/10" />
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  )
}
