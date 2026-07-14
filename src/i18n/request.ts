import { getRequestConfig } from "next-intl/server"

import { defaultLocale, isAppLocale } from "@/i18n/locale"

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale
  const locale = isAppLocale(requestedLocale) ? requestedLocale : defaultLocale
  const messages = (await import(`../../content/dictionaries/${locale}.json`))
    .default

  if (locale === "de") {
    const contactForm = (
      await import("../../content/dictionaries/contact/de.json")
    ).default

    return {
      locale,
      messages: {
        ...messages,
        contact: {
          ...messages.contact,
          form: contactForm,
        },
      },
    }
  }

  return {
    locale,
    messages,
  }
})
