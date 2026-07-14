import { describe, expect, it } from "vitest"

import {
  createLocaleSwitchHref,
  getLocalizedLanguageName,
} from "./language-navigation"

describe("language navigation", () => {
  it("preserves the current pathname without adding an empty query string", () => {
    expect(createLocaleSwitchHref("/about", new URLSearchParams())).toBe(
      "/about"
    )
  })

  it("preserves all query-string values while switching locales", () => {
    const searchParams = new URLSearchParams()
    searchParams.append("tag", "AI Engineering")
    searchParams.append("page", "2")
    searchParams.append("tag", "Backend")

    expect(createLocaleSwitchHref("/articles", searchParams)).toBe(
      "/articles?tag=AI+Engineering&page=2&tag=Backend"
    )
  })

  it("returns localized names for every published language", () => {
    expect(getLocalizedLanguageName("en", "ar")).toBe("Arabic")
    expect(getLocalizedLanguageName("de", "ar")).toBe("Arabisch")
    expect(getLocalizedLanguageName("ar", "ar")).toBe("العربية")
  })
})
