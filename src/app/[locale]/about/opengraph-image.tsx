import { ImageResponse } from "next/og"
import { getTranslations } from "next-intl/server"

import { routing } from "@/i18n/routing"
import { siteConfig } from "@/lib/config/site"

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
    namespace: "about.metadata.socialImage",
  })

  const direction = safeLocale === "ar" ? "rtl" : "ltr"

  return new ImageResponse(
    <div
      dir={direction}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px",
        background:
          "linear-gradient(135deg, #09090b 0%, #18181b 55%, #27272a 100%)",
        color: "#fafafa",
        fontFamily: "sans-serif",
        textAlign: direction === "rtl" ? "right" : "left",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            padding: "10px 18px",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "999px",
            color: "#d4d4d8",
            fontSize: "23px",
          }}
        >
          {t("badge")}
        </div>

        <div
          style={{
            display: "flex",
            color: "#a1a1aa",
            fontSize: "23px",
          }}
        >
          {siteConfig.url.hostname}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "1050px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: "68px",
            lineHeight: 1.05,
            fontWeight: 700,
            letterSpacing: direction === "rtl" ? "0" : "-2px",
          }}
        >
          {t("headline")}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "20px",
            fontSize: "34px",
            color: "#d4d4d8",
          }}
        >
          {t("role")}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "28px",
            maxWidth: "940px",
            fontSize: "27px",
            lineHeight: 1.4,
            color: "#a1a1aa",
          }}
        >
          {t("description")}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid rgba(255,255,255,0.14)",
          paddingTop: "28px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: "23px",
            color: "#a1a1aa",
          }}
        >
          {t("technologies")}
        </div>

        <div
          style={{
            display: "flex",
            padding: "12px 20px",
            borderRadius: "10px",
            background: "#fafafa",
            color: "#18181b",
            fontSize: "21px",
            fontWeight: 600,
          }}
        >
          {t("action")}
        </div>
      </div>
    </div>,
    size
  )
}
