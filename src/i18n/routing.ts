// i18n/routing.ts
import { defineRouting } from "next-intl/routing"
import { createNavigation } from "next-intl/navigation"
import { LOCALE } from "@/lib/types"

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: Object.values(LOCALE),

  // Used when no locale matches
  defaultLocale: LOCALE.en,

  // The prefix for the locale in the URL
  localePrefix: "always",
})

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
