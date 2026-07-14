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

  it("accepts every published locale", () => {
    for (const locale of publishedLocales) {
      expect(isAppLocale(locale)).toBe(true)
    }
  })

  it("rejects unsupported and malformed locale values", () => {
    const unsupportedValues: unknown[] = ["fr", "", undefined, null, 42]

    for (const value of unsupportedValues) {
      expect(isAppLocale(value)).toBe(false)
    }
  })

  it("returns the configured text direction", () => {
    expect(getTextDirection("en")).toBe("ltr")
    expect(getTextDirection("de")).toBe("ltr")
    expect(getTextDirection("ar")).toBe("rtl")
  })
})
