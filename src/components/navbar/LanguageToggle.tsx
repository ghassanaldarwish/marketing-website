"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

import { useTransition } from "react"
import {
  useParams,
  usePathname,
  useSearchParams,
  useRouter,
} from "next/navigation"
import useTextDirection from "@/hooks/useTextDirection"
import { LOCALE } from "@/lib/types"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface Language {
  name: string
  icon: string
}

interface Languages {
  [key: string]: Language
}

const languages: Languages = {
  en: {
    name: "English",
    icon: "/united-kingdom-icon.png",
  },
  ar: {
    name: "العربية",
    icon: "/united-arab-emirates-icon.png",
  },
}

export default function LanguageToggle() {
  const { locale } = useParams<{ locale: string }>()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [, startTransition] = useTransition()
  //const direction = useTextDirection()
  // Ensure locale is a valid key of languages or default to 'en'
  // const safeLocale =
  //   typeof locale === "string" && languages.hasOwnProperty(locale)
  //     ? locale
  //     : "en"
  //const languageInfo: Language = languages[safeLocale] // Now accessing with a guaranteed string key

  const selectorHandler = (lang: string) => {
    if (!lang) return

    const url = `${pathname}?${searchParams}`.replace(/^\/[a-z]{2}/, `/${lang}`)
    startTransition(() => {
      router.replace(url, { scroll: false })
    })
  }

  return (
    <div className="flex gap-2">
      <Image
        onClick={() => selectorHandler(LOCALE.de)}
        src="/de.svg"
        width={80}
        height={30}
        className={cn(
          "w-6 cursor-pointer",
          locale === LOCALE.en
            ? "opacity-100"
            : "scale-90 cursor-not-allowed opacity-50"
        )}
        alt="Ghassan Hero"
        loading="eager"
      />

      <Image
        onClick={() => selectorHandler(LOCALE.en)}
        src="/gb.svg"
        width={80}
        height={30}
        className={cn(
          "w-6 cursor-pointer",
          locale === LOCALE.en
            ? "scale-90 cursor-not-allowed opacity-50"
            : "opacity-100"
        )}
        alt="Ghassan Hero"
        loading="eager"
      />
    </div>
  )

  // return locale === LOCALE.de ? (

  //   <Button
  //     onClick={() => selectorHandler(LOCALE.en)}
  //     variant="outline"
  //     size="icon"
  //   >
  //     {LOCALE.de}
  //   </Button>
  // ) : (
  //   <Button
  //     onClick={() => selectorHandler(LOCALE.de)}
  //     variant="outline"
  //     size="icon"
  //   >
  //     {LOCALE.en}
  //   </Button>
  // )
}
