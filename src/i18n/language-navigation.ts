import type { AppLocale } from "@/i18n/locale"

type SearchParamsLike = Pick<URLSearchParams, "toString">

export function createLocaleSwitchHref(
  pathname: string,
  searchParams: SearchParamsLike
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
