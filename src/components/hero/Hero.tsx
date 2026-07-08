import Image from "next/image"
import { useTranslations } from "next-intl"
import { Button } from "../ui/button"
import { TechBadge } from "./TechBadge"
import { EncryptedText } from "./EncryptedText"
import GridBackground from "../gridBackground/GridBackground"
import { Terminal } from "./Terminal"

export default function Hero() {
  const t = useTranslations("hero")
  const title = t("title")
  const description = t("description")
  const contact = t("contact")
  const secondaryTitle = t("secondaryTitle")
  return (
    <div className="relative px-2 lg:px-0">
      <GridBackground />
      <div className="relative m-auto flex h-full max-w-6xl flex-col lg:flex-row">
        <div className="flex w-full flex-col gap-4 pt-16 lg:w-[70%] lg:gap-8 lg:self-center lg:pt-0">
          <TechBadge />

          <h1 className="text-3xl lg:text-6xl">
            {title} <br /> {secondaryTitle}
          </h1>

          <p className="text-xl">{description}</p>
          <div className="flex items-center justify-center gap-4 lg:justify-start">
            <Button size="lg" className="text-lg">
              {contact}
            </Button>

            <div>Berlin, Germany</div>
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

      <section className="relative m-auto flex w-full max-w-6xl flex-col">
        <div className="-top-11 hidden w-full lg:absolute lg:left-1/2 lg:block lg:-translate-x-1/2">
          <h2 className="m-auto max-w-6xl bg-background/20 px-2 backdrop-blur-xs lg:py-2 lg:text-left lg:text-lg">
            <EncryptedText
              text="7+ years of experience designing and building software systems."
              encryptedClassName="text-neutral-500"
              revealedClassName="dark:text-white text-black"
              revealDelayMs={50}
            />
          </h2>
        </div>
        <Terminal
          className="w-full"
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
      </section>
    </div>
  )
}
