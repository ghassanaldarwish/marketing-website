const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://ghassan.de"

function createSiteUrl(): URL {
  try {
    return new URL(rawSiteUrl)
  } catch {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL must be a valid absolute URL. Received: "${rawSiteUrl}"`
    )
  }
}

export const siteConfig = {
  name: "Ghassan",
  fullName: "Ghassan Aldarwish",

  url: createSiteUrl(),

  title: "Ghassan — AI Engineer & Backend Engineer",

  description:
    "AI Engineer and Backend Engineer building production AI systems, scalable backend platforms, microservices and cloud-native applications.",

  twitterHandle: "@ghassanaldarwish",

  /**
   * Must exist under:
   * public/images/social/default-og.png
   */
  defaultSocialImage: "/images/social/default-og.png",
} as const

export const isProductionDeployment =
  process.env.VERCEL_ENV !== undefined
    ? process.env.VERCEL_ENV === "production"
    : process.env.NODE_ENV === "production"

export function absoluteUrl(pathOrUrl: string): string {
  return new URL(pathOrUrl, siteConfig.url).toString()
}

export function getOpenGraphLocale(locale: string): string {
  const localeMap: Record<string, string> = {
    en: "en_US",
    de: "de_DE",
    ar: "ar_AR",
  }

  return localeMap[locale] ?? locale.replace("-", "_")
}
