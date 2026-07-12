import { ArrowLeft, Home, Layers3 } from "lucide-react"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import GridBackground from "@/components/ui/GridBackground"

export default function NotFoundPage() {
  const locale = useLocale()
  const t = useTranslations("notFound")

  return (
    <main className="relative isolate flex min-h-[calc(100vh-5rem)] items-center overflow-hidden px-4 py-20 sm:px-6 lg:py-28">
      <GridBackground />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,transparent_0%,var(--background)_72%)]"
      />

      <div className="relative mx-auto w-full max-w-4xl">
        <div className="overflow-hidden rounded-4xl border border-border bg-background/80 shadow-2xl shadow-foreground/5 backdrop-blur-xl">
          <div className="grid lg:grid-cols-[0.7fr_1.3fr]">
            <div className="flex min-h-64 items-center justify-center border-b border-border bg-foreground/2 p-10 lg:min-h-full lg:border-r lg:border-b-0">
              <div className="relative flex size-44 items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-border" />

                <div className="absolute inset-5 rounded-full border border-dashed border-border" />

                <div className="absolute inset-10 rounded-full bg-muted" />

                <span className="relative text-6xl font-semibold tracking-tighter text-foreground sm:text-7xl">
                  404
                </span>
              </div>
            </div>

            <div className="p-8 sm:p-12 lg:p-16">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-foreground/2 text-accent-foreground">
                <Layers3 className="size-6" aria-hidden="true" />
              </div>

              <p className="mt-8 text-sm font-medium tracking-widest text-accent-foreground uppercase">
                {t("eyebrow")}
              </p>

              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                {t("title")}
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                {t("description")}
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href={`/${locale}`}>
                    <Home className="size-4" aria-hidden="true" />

                    {t("home")}
                  </Link>
                </Button>

                <Button asChild size="lg" variant="outline">
                  <Link href={`/${locale}/articles`}>
                    {t("engineering")}

                    <ArrowLeft
                      className="size-4 rotate-180 rtl:rotate-0"
                      aria-hidden="true"
                    />
                  </Link>
                </Button>
              </div>

              <p className="mt-8 text-sm text-muted-foreground">{t("hint")}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
