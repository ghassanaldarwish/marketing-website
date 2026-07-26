import { ImageResponse } from "next/og"
import { getTranslations } from "next-intl/server"

import { SocialImage } from "@/components/seo/socialImage"
import { routing } from "@/i18n/routing"

export const alt = "Ghassan Aldarwish — Senior Backend & Platform Engineer"

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

type TwitterImageProps = {
  params: Promise<{
    locale: string
  }>
}

export default async function TwitterImage({ params }: TwitterImageProps) {
  const { locale } = await params

  const safeLocale = routing.locales.includes(
    locale as (typeof routing.locales)[number]
  )
    ? locale
    : routing.defaultLocale

  const t = await getTranslations({
    locale: safeLocale,
    namespace: "home.metadata",
  })

  return new ImageResponse(
    <SocialImage
      badge={t("socialImage.expertise")}
      headline={t("headline")}
      description={t("shortDescription")}
      role={t("socialImage.twitterRole")}
      action={t("socialImage.twitterAction")}
      direction={safeLocale === "ar" ? "rtl" : "ltr"}
    />,
    size
  )
}
