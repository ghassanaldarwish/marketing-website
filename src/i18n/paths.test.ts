import { describe, expect, it } from "vitest"

import { createArticlePath, createLocalizedPath } from "./paths"

describe("createLocalizedPath", () => {
  it.each([
    ["en", "", "/en"],
    ["de", "/", "/de"],
    ["ar", "/about", "/ar/about"],
    ["en", "contact", "/en/contact"],
  ] as const)("creates %s %s", (locale, path, expected) => {
    expect(createLocalizedPath(locale, path)).toBe(expected)
  })
})

describe("createArticlePath", () => {
  it("preserves the existing article route shape", () => {
    expect(createArticlePath("de", "backend-platform")).toBe(
      "/de/articles/backend-platform"
    )
  })
})
