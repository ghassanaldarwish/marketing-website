import type { AppLocale } from "./locale"

function normalizePath(path: string): string {
  if (path === "" || path === "/") {
    return ""
  }

  return path.startsWith("/") ? path : `/${path}`
}

export function createLocalizedPath(
  locale: AppLocale,
  path: string = ""
): string {
  return `/${locale}${normalizePath(path)}`
}

export function createArticlePath(locale: AppLocale, slug: string): string {
  return createLocalizedPath(locale, `/articles/${slug}`)
}
