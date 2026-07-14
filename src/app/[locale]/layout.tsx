import type { Metadata } from "next"
import type { ReactNode } from "react"

import { Geist_Mono, Inter, Noto_Sans_Arabic } from "next/font/google"
import { notFound } from "next/navigation"

import { NextIntlClientProvider } from "next-intl"
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server"

import "../../styles/globals.css"
import "../../styles/rtl-typography.css"

import Footer from "@/components/footer/Footer"
import Navbar from "@/components/navbar/Navbar"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { getTextDirection, isAppLocale, publishedLocales } from "@/i18n/locale"
import { createLocalizedPath } from "@/i18n/paths"
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

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})

type LocaleLayoutProps = Readonly<{
  children: ReactNode
  params: Promise<{
    locale: string
  }>
}>

export function generateStaticParams() {
  return publishedLocales.map((locale) => ({
    locale,
  }))
}

export async function generateMetadata({
  params,
}: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params

  if (!isAppLocale(locale)) {
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
        url: absoluteUrl(createLocalizedPath(locale, "/about")),
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
    openGraph: {
      type: "website",
      title: defaultTitle,
      description,
      siteName: siteConfig.name,
      locale: getOpenGraphLocale(locale),
      alternateLocale: publishedLocales
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
        ? { google: process.env.GOOGLE_SITE_VERIFICATION }
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

  if (!isAppLocale(locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const messages = await getMessages({ locale })
  const direction = getTextDirection(locale)

  return (
    <html
      lang={locale}
      dir={direction}
      data-locale={locale}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={cn(
        inter.variable,
        notoSansArabic.variable,
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
