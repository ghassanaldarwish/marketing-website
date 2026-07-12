// i18n/request.ts

import { getRequestConfig } from "next-intl/server"
import { routing } from "./routing"
import { LOCALE } from "@/lib/types"

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as LOCALE)) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`../../content/dictionaries/${locale}.json`))
      .default,
  }
})
