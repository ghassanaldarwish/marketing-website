// app/[locale]/layout.tsx
import { Geist_Mono, Inter } from "next/font/google"
import "../../styles/globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { cn } from "@/lib/utils"
import Navbar from "@/components/navbar/Navbar"
import Footer from "@/components/footer/Footer"
import { routing } from "@/i18n/routing"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { isRtlLang } from "rtl-detect"
import { Toaster } from "@/components/ui/sonner";

import { notFound } from "next/navigation"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params

  // Ensure that the incoming `locale` is valid
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  const messages = await getMessages()

  const direction = isRtlLang(locale) ? "rtl" : "ltr" // Direct approach without hooks
  return (
    <html
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
      data-scroll-behavior="smooth"

      lang={locale}
      dir={direction}
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
                      <Toaster expand={true} position="top-center" offset={{ top: 70 }} />

          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
