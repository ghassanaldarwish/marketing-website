import { ImageResponse } from "next/og"
import { getTranslations } from "next-intl/server"

import { SocialImage } from "@/components/seo/socialImage"

import { routing } from "@/i18n/routing"

export const alt = "Engineering articles by Ghassan Aldarwish"

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

function isSupportedLocale(
  locale: string
): locale is (typeof routing.locales)[number] {
  return routing.locales.includes(locale as (typeof routing.locales)[number])
}

export default async function OpenGraphImage({ params }: OpenGraphImageProps) {
  const { locale } = await params

  const safeLocale = isSupportedLocale(locale) ? locale : routing.defaultLocale

  const t = await getTranslations({
    locale: safeLocale,
    namespace: "articles.metadata.socialImage",
  })

  return new ImageResponse(
    <SocialImage
      badge={t("badge")}
      headline={t("headline")}
      description={t("description")}
      role={t("role")}
      action={t("action")}
      direction={safeLocale === "ar" ? "rtl" : "ltr"}
    />,
    size
  )
}
