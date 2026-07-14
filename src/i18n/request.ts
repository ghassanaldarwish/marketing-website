import { getRequestConfig } from "next-intl/server"

import { defaultLocale, isAppLocale } from "@/i18n/locale"

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale
  const locale = isAppLocale(requestedLocale) ? requestedLocale : defaultLocale

  return {
    locale,
    messages: (await import(`../../content/dictionaries/${locale}.json`))
      .default,
  }
})
