import Image from "next/image"
import { useTranslations } from "next-intl"
import { TechBadge } from "./TechBadge"
import { EncryptedText } from "../ui/EncryptedText"
import { Terminal } from "../ui/Terminal"
import InfiniteMovingCards from "../ui/InfiniteMovingCards"
import { ContactModel } from "../contact/Contact"
import { Icons } from "../ui/icons"

export default function Hero() {
  const t = useTranslations("hero")
  const title = t("title")
  const description = t("description")

  const secondaryTitle = t("secondaryTitle")
  return (
    <div className="relative px-2 lg:mb-24 lg:px-0">
      <div className="relative m-auto flex h-full max-w-6xl flex-col pt-12 md:mt-0 lg:flex-row">
        <div className="lh:gap-4 flex w-full flex-col justify-end gap-8 lg:gap-10 lg:pt-0">
          <TechBadge />

          <h1 className="text-3xl lg:text-6xl">
            {title} <br /> {secondaryTitle}
          </h1>

          <p className="min-h-30 text-xl md:min-h-10">
            <EncryptedText
              text={description}
              encryptedClassName="text-neutral-500"
              revealedClassName="leading-8 text-muted-foreground"
              revealDelayMs={50}
            />
          </p>
          <div className="flex items-center justify-start gap-8">
            <ContactModel />

            <div className="flex items-center gap-4">
              <Icons.twitter />
              <Icons.linkedin />
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
        <div className="flex lg:w-[62%]">
          <InfiniteMovingCards className="bg-background/10 text-lg leading-8 text-muted-foreground backdrop-blur-xs">
            <p>7+ Years Experience</p>
            <p>Berlin, Germany</p>
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
