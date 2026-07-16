import { createNavigation } from "next-intl/navigation"
import { defineRouting } from "next-intl/routing"

import { defaultLocale, publishedLocales } from "@/i18n/locale"

export const routing = defineRouting({
  locales: publishedLocales,
  defaultLocale,
  localePrefix: "always",
})

export const { Link, usePathname, useRouter } = createNavigation(routing)
