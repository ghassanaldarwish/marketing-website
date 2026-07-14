"use client"

import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { useTransition } from "react"

import { isAppLocale, publishedLocales, type AppLocale } from "@/i18n/locale"
import {
  createLocaleSwitchHref,
  getLocalizedLanguageName,
} from "@/i18n/language-navigation"
import { usePathname, useRouter } from "@/i18n/routing"
import { cn } from "@/lib/utils"

type LanguageToggleProps = {
  onNavigate?: () => void
}

type LanguageOption = {
  id: AppLocale
  image?: string
  imageAlt?: string
  glyph?: string
}

const languages = [
  {
    id: "de",
    image: "/de.svg",
    imageAlt: "German flag",
  },
  {
    id: "en",
    image: "/gb.svg",
    imageAlt: "British flag",
  },
  {
    id: "ar",
    glyph: "ع",
  },
] satisfies LanguageOption[]

export default function LanguageToggle({ onNavigate }: LanguageToggleProps) {
  const runtimeLocale = useLocale()
  const locale = isAppLocale(runtimeLocale) ? runtimeLocale : null
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const t = useTranslations("navbar.language")
  const [isPending, startTransition] = useTransition()

  function changeLocale(nextLocale: AppLocale) {
    if (nextLocale === locale || isPending) {
      return
    }

    const href = createLocaleSwitchHref(pathname, searchParams)

    startTransition(() => {
      router.replace(href, {
        locale: nextLocale,
        scroll: false,
      })
      onNavigate?.()
    })
  }

  return (
    <div
      role="group"
      aria-label={t("selectorLabel")}
      className="flex items-center gap-2"
    >
      {languages.map((language) => {
        const isCurrent = locale === language.id
        const displayLocale = locale ?? publishedLocales[0]
        const languageName = getLocalizedLanguageName(
          displayLocale,
          language.id
        )
        const languageLabel = `${t("selectorLabel")}: ${languageName}`

        return (
          <button
            key={language.id}
            type="button"
            disabled={isCurrent || isPending}
            aria-label={
              isCurrent
                ? `${languageLabel}. ${t("currentLanguage")}`
                : languageLabel
            }
            aria-pressed={isCurrent}
            onClick={() => changeLocale(language.id)}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-md",
              "transition-[opacity,transform] focus-visible:outline-none",
              "focus-visible:ring-2 focus-visible:ring-ring",
              "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isCurrent
                ? "cursor-default opacity-50"
                : "cursor-pointer hover:scale-105 hover:bg-accent",
              isPending && "cursor-wait opacity-50"
            )}
          >
            {language.image ? (
              <Image
                src={language.image}
                width={24}
                height={18}
                alt={language.imageAlt ?? ""}
                loading="eager"
                className="h-auto w-6"
              />
            ) : (
              <span
                aria-hidden="true"
                lang="ar"
                dir="rtl"
                className="inline-flex size-6 items-center justify-center rounded-sm border border-border bg-background font-arabic text-sm font-semibold leading-none"
              >
                {language.glyph}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
