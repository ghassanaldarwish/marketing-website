import Image from "next/image"
import { HeroType } from "@/lib/types"
import { useTranslations } from "next-intl"
import { Button } from "../ui/button"
import { ColourfulText } from "./ColourfulText"
import { TechBadge } from "./TechBadge"

export default function Hero() {
  const t = useTranslations("hero")
  const title = t("title")
  const description = t("description")
  const contact = t("contact")
  const titleColourful = t("titleColourful")
  const secondaryTitle = t("secondaryTitle")
  return (
    <div className="relative h-screen px-2 lg:px-0">
      <div className="relative m-auto flex h-full max-w-6xl flex-col lg:flex-row">
        <div className="flex w-full flex-col gap-4 pt-16 lg:w-[70%] lg:gap-8 lg:self-center lg:pt-0">
          <TechBadge />
          <div className="flex gap-2 text-3xl lg:text-6xl">
            <h1 className="">{title}</h1>
            <div>
              <ColourfulText text={titleColourful} />
            </div>
          </div>
          <h2 className="text-3xl lg:text-6xl">{secondaryTitle}</h2>

          <p>{description}</p>
          <div className="flex items-center gap-4">
            <div>
              <Button size="lg" className="text-lg">
                {contact}
              </Button>
            </div>

            <div>Berlin, Germany</div>
          </div>
        </div>
        <div>
          <Image
            src="/hero.png"
            width={794}
            height={930}
            className="pt-14"
            alt="Ghassan Hero"
            loading="eager"
          />
        </div>
      </div>
    </div>
  )
}
