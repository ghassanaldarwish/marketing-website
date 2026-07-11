import type { Metadata } from "next"
import type { ReactNode } from "react"

import { Geist_Mono, Inter } from "next/font/google"
import { notFound } from "next/navigation"

import { hasLocale, NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"

import { isRtlLang } from "rtl-detect"

import "../../styles/globals.css"

import Navbar from "@/components/navbar/Navbar"
import Footer from "@/components/footer/Footer"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Toaster } from "@/components/ui/sonner"

import { routing } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import {
  absoluteUrl,
  getOpenGraphLocale,
  isProductionDeployment,
  siteConfig,
} from "@/lib/site"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
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

  const localeRoot = `/${locale}`
  const defaultLocaleRoot = `/${routing.defaultLocale}`

  const languageAlternates: Record<string, string> = Object.fromEntries(
    routing.locales.map((supportedLocale) => [
      supportedLocale,
      `/${supportedLocale}`,
    ])
  )

  languageAlternates["x-default"] = defaultLocaleRoot

  const socialImage = absoluteUrl(siteConfig.defaultSocialImage)

  return {
    metadataBase: siteConfig.url,

    /**
     * Child page:
     * title: "Building an AI Agent"
     *
     * Browser output:
     * Building an AI Agent | Ghassan
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
    category: "technology",

    referrer: "origin-when-cross-origin",

    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },

    alternates: {
      canonical: localeRoot,
      languages: languageAlternates,
    },

    openGraph: {
      type: "website",
      url: absoluteUrl(localeRoot),
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

    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? {
          verification: {
            google: process.env.GOOGLE_SITE_VERIFICATION,
          },
        }
      : {}),
  }
}

export default async function RootLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const messages = await getMessages()
  const direction = isRtlLang(locale) ? "rtl" : "ltr"

  return (
    <html
      suppressHydrationWarning
      lang={locale}
      dir={direction}
      data-scroll-behavior="smooth"
      className={cn("font-sans antialiased", inter.variable, fontMono.variable)}
    >
      <body>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen">
              <Navbar />

              {children}

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
