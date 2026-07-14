import { describe, expect, it } from "vitest"

import {
  defaultLocale,
  getTextDirection,
  isAppLocale,
  publishedLocales,
} from "@/i18n/locale"

describe("locale configuration", () => {
  it("defines the published locales once", () => {
    expect(publishedLocales).toEqual(["en", "de", "ar"])
    expect(new Set(publishedLocales).size).toBe(publishedLocales.length)
  })

  it("uses English as the default locale", () => {
    expect(defaultLocale).toBe("en")
  })

  it.each([
    ["en", true],
    ["de", true],
    ["ar", true],
    ["fr", false],
    ["", false],
    [undefined, false],
    [null, false],
  ])("validates %j", (value, expected) => {
    expect(isAppLocale(value)).toBe(expected)
  })

  it.each([
    ["en", "ltr"],
    ["de", "ltr"],
    ["ar", "rtl"],
  ] as const)("returns the direction for %s", (locale, direction) => {
    expect(getTextDirection(locale)).toBe(direction)
  })
})
