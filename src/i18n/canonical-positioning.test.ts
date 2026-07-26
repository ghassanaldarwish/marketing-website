import { readFileSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import ar from "../../content/dictionaries/ar.json"
import de from "../../content/dictionaries/de.json"
import en from "../../content/dictionaries/en.json"

const CANONICAL = {
  en: {
    title: "Senior Backend & Platform Engineer",
    support:
      "Building reliable backend platforms, DevOps systems, and production AI workflows.",
  },
  de: {
    title: "Senior Backend & Platform Engineer",
    support:
      "Ich entwickle zuverlässige Backend-Plattformen, DevOps-Systeme und produktionsreife KI-Workflows.",
  },
  ar: {
    title: "مهندس أول للأنظمة الخلفية والمنصات",
    support:
      "أبني منصات خلفية موثوقة، وأنظمة DevOps، وسير عمل للذكاء الاصطناعي في بيئات الإنتاج.",
  },
} as const

const DEPRECATED_PHRASES = [
  "Junior AI Developer",
  "Junior-KI-Entwickler",
  "مطور ذكاء اصطناعي مبتدئ",
]

const dictionaries = { en, de, ar } as const

type Locale = keyof typeof dictionaries

const entries = Object.entries(dictionaries) as [
  Locale,
  (typeof dictionaries)[Locale],
][]

describe("canonical positioning", () => {
  it.each(entries)(
    "brand.role uses the canonical title (%s)",
    (locale, dict) => {
      expect(dict.brand.role).toBe(CANONICAL[locale].title)
    }
  )

  it.each(entries)(
    "homepage hero description uses the canonical supporting sentence (%s)",
    (locale, dict) => {
      expect(dict.home.hero.description).toBe(CANONICAL[locale].support)
    }
  )

  it.each(entries)(
    "home structured data uses a single canonical job title (%s)",
    (locale, dict) => {
      expect(dict.home.metadata.structuredData.jobTitles).toEqual([
        CANONICAL[locale].title,
      ])
    }
  )

  it.each(entries)(
    "contact structured data uses a single canonical job title (%s)",
    (locale, dict) => {
      expect(dict.contact.metadata.structuredData.jobTitles).toEqual([
        CANONICAL[locale].title,
      ])
    }
  )

  it.each(entries)(
    "about structured data uses a single canonical job title (%s)",
    (locale, dict) => {
      expect(dict.about.metadata.structuredData.jobTitles).toEqual([
        CANONICAL[locale].title,
      ])
    }
  )

  it.each(entries)(
    "social image roles use the canonical title (%s)",
    (locale, dict) => {
      const title = CANONICAL[locale].title
      expect(dict.home.metadata.socialImage.role).toBe(title)
      expect(dict.home.metadata.socialImage.twitterRole).toBe(title)
      expect(dict.contact.metadata.socialImage.role).toBe(title)
      expect(dict.about.metadata.socialImage.role).toBe(title)
      expect(dict.articles.metadata.socialImage.role).toBe(title)
    }
  )

  it.each(entries)(
    "no deprecated junior-AI positioning remains in current public identity namespaces (%s)",
    (locale, dict) => {
      const publicIdentityNamespaces = JSON.stringify({
        brand: dict.brand,
        metadata: dict.metadata,
        home: dict.home,
        contact: dict.contact,
        about: {
          metadata: dict.about.metadata,
          intro: dict.about.intro,
        },
        articles: dict.articles,
      })

      for (const phrase of DEPRECATED_PHRASES) {
        expect(publicIdentityNamespaces).not.toContain(phrase)
      }
    }
  )

  const STALE_SOURCE_FILES = [
    "src/components/seo/article-social-image.tsx",
    "src/app/[locale]/page.tsx",
    "src/app/[locale]/twitter-image.tsx",
    "src/app/[locale]/opengraph-image.tsx",
    "src/app/[locale]/about/opengraph-image.tsx",
    "src/app/[locale]/contact/opengraph-image.tsx",
  ]

  const STALE_POSITIONING_PHRASES = [
    "Junior AI Developer",
    "Backend Developer, DevOps Engineer",
    "Backend Developer · DevOps Engineer",
  ]

  it.each(STALE_SOURCE_FILES)(
    "%s contains no stale hardcoded junior-positioning fallback",
    (relativePath) => {
      const source = readFileSync(join(process.cwd(), relativePath), "utf-8")

      for (const phrase of STALE_POSITIONING_PHRASES) {
        expect(source).not.toContain(phrase)
      }
    }
  )
})
