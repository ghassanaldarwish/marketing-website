export const publishedLocales = ["en", "de", "ar"] as const

export type AppLocale = (typeof publishedLocales)[number]

export type TextDirection = "ltr" | "rtl"

export const defaultLocale: AppLocale = "en"

const textDirectionByLocale = {
  en: "ltr",
  de: "ltr",
  ar: "rtl",
} as const satisfies Record<AppLocale, TextDirection>

export function isAppLocale(value: unknown): value is AppLocale {
  return (
    typeof value === "string" &&
    publishedLocales.some((locale) => locale === value)
  )
}

export function getTextDirection(locale: AppLocale): TextDirection {
  return textDirectionByLocale[locale]
}
