import type { Metadata } from "next"
import type { ReactNode } from "react"

import { Geist_Mono, Inter } from "next/font/google"
import { notFound } from "next/navigation"

import { hasLocale, NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"

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
} from "@/lib/site"
import { cn } from "@/lib/utils"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const fontMono = Geist_Mono({
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

export async function generateMetadata({
  params,
}: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    return {}
  }

  const socialImage = absoluteUrl(siteConfig.defaultSocialImage)

  return {
    metadataBase: siteConfig.url,

    /**
     * Child pages can return:
     *
     * title: "About Me"
     *
     * Browser output:
     *
     * About Me | Ghassan
     */
    title: {
      default: siteConfig.title,
      template: "%s | Ghassan",
    },

    description: siteConfig.description,

    applicationName: siteConfig.name,

    authors: [
      {
        name: siteConfig.fullName,
        url: absoluteUrl(`/${locale}/about`),
      },
    ],

    creator: siteConfig.fullName,
    publisher: siteConfig.fullName,
    category: "Technology",

    referrer: "origin-when-cross-origin",

    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },

    /**
     * These are safe global defaults.
     *
     * Each page should provide its own:
     * - canonical URL
     * - hreflang alternates
     * - Open Graph URL
     * - page-specific title and description
     */
    openGraph: {
      type: "website",
      title: siteConfig.title,
      description: siteConfig.description,
      siteName: siteConfig.name,
      locale: getOpenGraphLocale(locale),

      alternateLocale: routing.locales
        .filter((supportedLocale) => supportedLocale !== locale)
        .map(getOpenGraphLocale),

      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: `${siteConfig.fullName} — AI Engineer and Backend Engineer`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: siteConfig.title,
      description: siteConfig.description,
      site: siteConfig.twitterHandle,
      creator: siteConfig.twitterHandle,

      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: `${siteConfig.fullName} — AI Engineer and Backend Engineer`,
        },
      ],
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
   * Allows next-intl to use the route locale and helps
   * enable static rendering for localized routes.
   */
  setRequestLocale(locale)

  const messages = await getMessages()
  const direction = isRtlLang(locale) ? "rtl" : "ltr"

  return (
    <html
      lang={locale}
      dir={direction}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={cn(inter.variable, fontMono.variable, "font-sans antialiased")}
    >
      <body className="min-h-screen bg-background text-foreground">
        <NextIntlClientProvider messages={messages}>
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
