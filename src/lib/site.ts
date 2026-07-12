// lib/site.ts

const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://ghassan.de"

function createSiteUrl(): URL {
  try {
    const url = new URL(rawSiteUrl)

    url.pathname = "/"
    url.search = ""
    url.hash = ""

    return url
  } catch {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL must be a valid absolute URL. Received: "${rawSiteUrl}"`
    )
  }
}

export const siteConfig = {
  name: "Ghassan",
  fullName: "Ghassan Aldarwish",
  handle: "@ghassanaldarwish",

  url: createSiteUrl(),

  twitterHandle: "@ghassanaldarwish",

  socialLinks: {
    linkedin: "https://www.linkedin.com/in/ghassanaldarwish",
    github: "https://github.com/ghassanaldarwish",
  },

  profileImage: "/images/ghassan-profile.png",
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
