import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { ContactDialog } from "@/features/contact/contact-dialog"
import { Link as LocalizedLink } from "@/i18n/routing"
import { siteConfig } from "@/lib/config/site"

import { Terminal } from "../ui/Terminal"
import { Icons } from "../ui/icons"
import { TechBadge } from "./TechBadge"

export default function Hero() {
  const t = useTranslations("home")
  const title = t("hero.title")
  const description = t("hero.description")
  const secondaryTitle = t("hero.secondaryTitle")
  const infiniteMovingCards = t.raw("hero.infiniteMovingCards") as string[]

  return (
    <div
      className="relative overflow-x-clip px-2 lg:mb-24 lg:px-0"
      data-testid="hero"
    >
      <div className="relative m-auto flex h-full max-w-6xl flex-col pt-12 md:mt-0 lg:flex-row">
        <div className="flex w-full flex-col justify-end gap-4 sm:gap-6 lg:gap-10 lg:pt-0">
          <TechBadge />

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl"
            data-testid="hero-heading"
          >
            {title} <br /> {secondaryTitle}
          </h1>

          <p className="text-lg leading-relaxed sm:text-xl">{description}</p>

          <div
            className="flex min-w-0 flex-wrap items-center justify-start gap-x-3 gap-y-4"
            data-testid="hero-actions"
          >
            <Button
              size="lg"
              className="h-auto min-h-11 max-w-full min-w-0 text-center text-lg whitespace-normal"
              asChild
            >
              <LocalizedLink
                href="/articles"
                data-testid="hero-engineering-action"
              >
                {t("hero.viewEngineering")}

                <ArrowRight
                  aria-hidden="true"
                  className="ms-1 size-4 rtl:rotate-180"
                />
              </LocalizedLink>
            </Button>

            <ContactDialog triggerVariant="outline" />

            <div className="ms-2 flex shrink-0 items-center gap-4">
              <Link
                href={siteConfig.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <Icons.gitHub
                  aria-hidden="true"
                  className="h-10 w-10 text-foreground/60 transition-colors hover:text-foreground/80"
                />
              </Link>

              <Link
                href={siteConfig.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <Icons.linkedin
                  aria-hidden="true"
                  className="h-10 w-10 text-foreground/60 transition-colors hover:text-foreground/80"
                />
              </Link>
            </div>
          </div>
        </div>

        <div className="relative">
          <Image
            src="/hero.png"
            width={794}
            height={930}
            className="hero-portrait h-80 w-full object-contain object-bottom pt-4 sm:h-[30rem] sm:pt-6 lg:h-auto lg:w-auto lg:pt-14"
            data-testid="hero-portrait"
            alt="Ghassan Hero"
            loading="eager"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
      </div>

      <div className="relative m-auto max-w-6xl items-end justify-between lg:flex">
        <div className="min-w-0 lg:w-[59%]">
          <ul
            className="grid w-full grid-cols-2 gap-x-4 gap-y-2 bg-background/10 py-4 text-center text-sm leading-6 text-muted-foreground backdrop-blur-xs sm:grid-cols-4 sm:text-base lg:flex lg:flex-wrap lg:text-lg lg:leading-8"
            data-testid="hero-metrics"
          >
            {infiniteMovingCards.map((item) => (
              <li className="min-w-0" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="hidden h-62 lg:block lg:w-[41%]"
          data-testid="hero-terminal"
        >
          <Terminal
            initialDelay={800}
            className="z-10 h-full w-full"
            commands={[
              "npx ai architect",
              "pnpm build",
              "git push origin main",
            ]}
            outputs={{
              0: [
                "Analyzing project...",
                "✔ Suggested microservice architecture",
                "✔ Generated deployment strategy",
              ],
              1: ["✓ Build completed"],
              2: ["✔ Deployment started..."],
            }}
            typingSpeed={45}
            delayBetweenCommands={1000}
          />
        </div>
      </div>
    </div>
  )
}
