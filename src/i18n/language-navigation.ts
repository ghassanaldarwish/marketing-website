import type { AppLocale } from "@/i18n/locale"

export function createLocaleSwitchHref(
  pathname: string,
  searchParams: URLSearchParams
): string {
  const queryString = searchParams.toString()

  return queryString ? `${pathname}?${queryString}` : pathname
}

export function getLocalizedLanguageName(
  displayLocale: AppLocale,
  languageLocale: AppLocale
): string {
  const displayNames = new Intl.DisplayNames([displayLocale], {
    type: "language",
  })

  return displayNames.of(languageLocale) ?? languageLocale
}
