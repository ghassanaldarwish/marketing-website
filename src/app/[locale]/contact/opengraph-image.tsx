import { ImageResponse } from "next/og"
import { getTranslations } from "next-intl/server"

import { SocialImage } from "@/components/seo/socialImage"

import { routing } from "@/i18n/routing"

export const alt =
  "Contact Ghassan Aldarwish — Backend Developer, DevOps Engineer, and Junior AI Developer"

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

  const safeLocale = hasSupportedLocale(locale) ? locale : routing.defaultLocale

  const t = await getTranslations({
    locale: safeLocale,
    namespace: "contact.metadata.socialImage",
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

function hasSupportedLocale(
  locale: string
): locale is (typeof routing.locales)[number] {
  return routing.locales.includes(locale as (typeof routing.locales)[number])
}
