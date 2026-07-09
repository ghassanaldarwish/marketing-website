import Image from "next/image"
import { useTranslations } from "next-intl"
import { Button } from "../ui/button"
import { TechBadge } from "./TechBadge"
import { EncryptedText } from "./EncryptedText"
import GridBackground from "../gridBackground/GridBackground"
import { Terminal } from "../terminal/Terminal"
import InfiniteMovingCards from "../ui/InfiniteMovingCards"

export default function Hero() {
  const t = useTranslations("hero")
  const title = t("title")
  const description = t("description")
  const contact = t("contact")
  const secondaryTitle = t("secondaryTitle")
  return (
    <div className="relative px-2 lg:px-0">
      <GridBackground />
      <div className="relative m-auto mt-12 flex h-full max-w-6xl flex-col md:mt-0 lg:flex-row">
        <div className="flex w-full flex-col justify-end gap-4 lg:gap-10 lg:pt-0">
          <TechBadge />

          <h1 className="text-3xl lg:text-6xl">
            {title} <br /> {secondaryTitle}
          </h1>

          <p className="min-h-30 text-xl md:min-h-10">
            <EncryptedText
              text={description}
              encryptedClassName="text-neutral-500"
              revealedClassName="dark:text-white text-black"
              revealDelayMs={50}
            />
          </p>
          <div className="flex items-center justify-center gap-6 lg:justify-start">
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
      <div className="relative m-auto hidden max-w-6xl items-end justify-between md:flex">
        <div className="flex lg:w-[62%]">
          <InfiniteMovingCards className="bg-background/10 text-foreground/80 backdrop-blur-xs">
            <p>7+ Years Experience</p>
            <p>AI Engineering</p>
            <p>Production Backend Systems</p>
            <p>Cloud & DevOps</p>
          </InfiniteMovingCards>
        </div>
        <Terminal
          initialDelay={6000}
          className="h-62 sm:w-full lg:w-[38%]"
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
      </div>{" "}
    </div>
  )
}
