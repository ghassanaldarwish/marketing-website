"use client"

import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { useTransition } from "react"

import { usePathname, useRouter } from "@/i18n/routing"
import { LOCALE } from "@/lib/types"
import { cn } from "@/lib/utils"

type LanguageToggleProps = {
  onNavigate?: () => void
}

type SupportedLocale = LOCALE.en | LOCALE.de

export default function LanguageToggle({ onNavigate }: LanguageToggleProps) {
  const locale = useLocale() as SupportedLocale
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const t = useTranslations("navbar.language")
  const [isPending, startTransition] = useTransition()

  function changeLocale(nextLocale: SupportedLocale) {
    if (nextLocale === locale || isPending) {
      return
    }

    const queryString = searchParams.toString()

    const href = queryString ? `${pathname}?${queryString}` : pathname

    startTransition(() => {
      router.replace(href, {
        locale: nextLocale,
        scroll: false,
      })

      onNavigate?.()
    })
  }

  const languages = [
    {
      id: LOCALE.de,
      image: "/de.svg",
      alt: "German flag",
      label: t("switchToGerman"),
    },
    {
      id: LOCALE.en,
      image: "/gb.svg",
      alt: "British flag",
      label: t("switchToEnglish"),
    },
  ] satisfies Array<{
    id: SupportedLocale
    image: string
    alt: string
    label: string
  }>

  return (
    <div
      role="group"
      aria-label={t("selectorLabel")}
      className="flex items-center gap-2"
    >
      {languages.map((language) => {
        const isCurrent = locale === language.id

        return (
          <button
            key={language.id}
            type="button"
            disabled={isCurrent || isPending}
            aria-label={
              isCurrent
                ? `${language.label}. ${t("currentLanguage")}`
                : language.label
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
            <Image
              src={language.image}
              width={24}
              height={18}
              alt={language.alt}
              loading="eager"
              className="h-auto w-6"
            />
          </button>
        )
      })}
    </div>
  )
}
