import type { Metadata } from "next"
import type { ReactNode } from "react"

import { Geist_Mono, Inter } from "next/font/google"
import { notFound } from "next/navigation"

import { hasLocale, NextIntlClientProvider } from "next-intl"
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server"

import { isRtlLang } from "rtl-detect"

import "../../styles/globals.css"

import Footer from "@/components/footer/Footer"
import Navbar from "@/components/navbar/Navbar"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Toaster } from "@/components/ui/sonner"

import { routing } from "@/i18n/routing"
import {
  absoluteUrl,
  getOpenGraphLocale,
  isProductionDeployment,
  siteConfig,
} from "@/lib/config/site"
import { cn } from "@/lib/utils"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

type LocaleLayoutProps = Readonly<{
  children: ReactNode
  params: Promise<{
    locale: string
  }>
}>

export function generateStaticParams() {
  return routing.locales.map((locale) => ({
    locale,
  }))
}

export async function generateMetadata({
  params,
}: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    return {}
  }

  const t = await getTranslations({
    locale,
    namespace: "metadata",
  })

  const defaultTitle = t("defaultTitle")
  const description = t("description")
  const category = t("category")

  return {
    metadataBase: siteConfig.url,

    title: {
      default: defaultTitle,
      template: "%s | Ghassan",
    },

    description,

    applicationName: siteConfig.name,

    authors: [
      {
        name: siteConfig.fullName,
        url: absoluteUrl(`/${locale}/about`),
      },
    ],

    creator: siteConfig.fullName,
    publisher: siteConfig.fullName,
    category,

    referrer: "origin-when-cross-origin",

    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },

    /**
     * The page-level metadata should provide:
     * - canonical URL
     * - hreflang alternatives
     * - Open Graph URL
     * - page-specific title
     * - page-specific description
     *
     * Images are generated automatically by:
     * - app/[locale]/opengraph-image.tsx
     * - app/[locale]/twitter-image.tsx
     */
    openGraph: {
      type: "website",
      title: defaultTitle,
      description,
      siteName: siteConfig.name,
      locale: getOpenGraphLocale(locale),

      alternateLocale: routing.locales
        .filter((supportedLocale) => supportedLocale !== locale)
        .map(getOpenGraphLocale),
    },

    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description,
      site: siteConfig.twitterHandle,
      creator: siteConfig.twitterHandle,
    },

    robots: {
      index: isProductionDeployment,
      follow: isProductionDeployment,

      googleBot: {
        index: isProductionDeployment,
        follow: isProductionDeployment,
        noimageindex: false,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    verification: {
      ...(process.env.GOOGLE_SITE_VERIFICATION
        ? {
            google: process.env.GOOGLE_SITE_VERIFICATION,
          }
        : {}),

      ...(process.env.BING_SITE_VERIFICATION
        ? {
            other: {
              "msvalidate.01": process.env.BING_SITE_VERIFICATION,
            },
          }
        : {}),
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  /**
   * Makes the route locale available to next-intl and supports
   * static rendering for localized routes.
   */
  setRequestLocale(locale)

  const messages = await getMessages({
    locale,
  })

  const direction = isRtlLang(locale) ? "rtl" : "ltr"

  return (
    <html
      lang={locale}
      dir={direction}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={cn(
        inter.variable,
        geistMono.variable,
        "font-sans antialiased"
      )}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen bg-background text-foreground"
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex min-h-screen flex-col">
              <Navbar />

              <div className="flex-1">{children}</div>

              <Footer />
            </div>

            <Toaster
              expand
              position="top-center"
              offset={{
                top: 70,
              }}
            />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
