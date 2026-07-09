import Image from "next/image"
import { useTranslations } from "next-intl"
import { TechBadge } from "./TechBadge"
import { EncryptedText } from "../ui/EncryptedText"
import GridBackground from "../ui/GridBackground"
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
    <div className="relative px-2 lg:px-0 lg:mb-24 ">
      <GridBackground />
      <div className="relative m-auto mt-12 flex h-full max-w-6xl flex-col md:mt-0 lg:flex-row">
        <div className="flex w-full flex-col justify-end gap-8 lh:gap-4 lg:gap-10 lg:pt-0">
          <TechBadge />

          <h1 className="text-3xl lg:text-6xl">
            {title} <br /> {secondaryTitle}
          </h1>

          <p className="min-h-30 text-xl md:min-h-10 ">
            <EncryptedText
              text={description}
              encryptedClassName="text-neutral-500"
              revealedClassName="leading-8 text-muted-foreground"
              revealDelayMs={50}
            />
          </p>
          <div className="flex items-center justify-center gap-8 lg:justify-start">
            <ContactModel />
      
            <div className="flex gap-4 items-center">
              <Icons.twitter/>
              <Icons.linkedin/>


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
      <div className="relative m-auto hidden max-w-6xl items-end justify-between md:flex">
        <div className="flex lg:w-[62%]">
          <InfiniteMovingCards className="bg-background/10 leading-8 text-muted-foreground text-lg backdrop-blur-xs">
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
