import { ImageResponse } from "next/og"
import { getTranslations } from "next-intl/server"

import { SocialImage } from "@/components/seo/socialImage"
import { routing } from "@/i18n/routing"

export const alt = "Ghassan Aldarwish — AI Engineer and Backend Engineer"

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

type OpenGraphImageProps = {
  params: Promise<{
    locale: string
  }>
}

export default async function OpenGraphImage({ params }: OpenGraphImageProps) {
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
      badge={t("socialImage.availability")}
      headline={t("headline")}
      description={t("shortDescription")}
      role={t("socialImage.role")}
      action={t("socialImage.openGraphAction")}
      direction={safeLocale === "ar" ? "rtl" : "ltr"}
    />,
    size
  )
}
