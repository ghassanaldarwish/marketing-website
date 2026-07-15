import Image from "next/image"
import Link from "next/link"
import { useTranslations } from "next-intl"

import { ContactDialog } from "@/features/contact/contact-dialog"
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
    <div className="relative px-2 lg:mb-24 lg:px-0">
      <div className="relative m-auto flex h-full max-w-6xl flex-col pt-12 md:mt-0 lg:flex-row">
        <div className="lh:gap-4 flex w-full flex-col justify-end gap-8 lg:gap-10 lg:pt-0">
          <TechBadge />

          <h1 className="text-3xl lg:text-6xl">
            {title} <br /> {secondaryTitle}
          </h1>

          <p className="min-h-30 text-xl md:min-h-10">{description}</p>

          <div className="flex items-center justify-start gap-8">
            <ContactDialog />

            <div className="flex items-center gap-4">
              <Link href={siteConfig.socialLinks.github} target="_blank">
                <Icons.gitHub className="h-10 w-10 text-foreground/60 transition-colors hover:text-foreground/80" />
              </Link>

              <Link href={siteConfig.socialLinks.linkedin} target="_blank">
                <Icons.linkedin className="h-10 w-10 text-foreground/60 transition-colors hover:text-foreground/80" />
              </Link>
            </div>
          </div>
        </div>

        <div className="relative">
          <Image
            src="/hero.png"
            width={794}
            height={930}
            className="pt-8 lg:pt-14"
            alt="Ghassan Hero"
            loading="eager"
          />
        </div>
      </div>

      <div className="relative m-auto max-w-6xl items-end justify-between md:flex">
        <div className="flex lg:w-[59%]">
          <div className="flex w-full gap-4 bg-background/10 text-lg leading-8 text-muted-foreground backdrop-blur-xs">
            {infiniteMovingCards.map((item) => (
              <div className="text-nowrap" key={item}>
                {item}
              </div>
            ))}
          </div>
        </div>

        <Terminal
          initialDelay={800}
          className="z-10 h-62 sm:w-full lg:w-[41%]"
          commands={["npx ai architect", "pnpm build", "git push origin main"]}
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
  )
}
