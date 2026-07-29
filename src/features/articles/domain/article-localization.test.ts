import { readFileSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import ar from "../../../../content/dictionaries/ar.json"
import de from "../../../../content/dictionaries/de.json"
import en from "../../../../content/dictionaries/en.json"

describe("Article discovery localization", () => {
  const expectations = {
    en: {
      selected: en.home.selectedProjects,
      articles: en.articles.content,
      articlesMetadata: en.articles.metadata,
      selectedEyebrow: "Featured Articles",
      selectedTitle:
        "Engineering articles focused on architecture and decisions.",
      readArticle: "Read Article",
      viewArticle: "View article",
      technologies: "Technologies and patterns in {title}",
      pageName: "Engineering articles by Ghassan Aldarwish",
      socialHeadline: "Systems, designs, and reference architectures.",
      socialAction: "Explore the articles →",
      keywords: [
        "Ghassan Aldarwish Articles",
        "Software Engineering Articles",
        "AI Engineering Articles",
      ],
    },
    de: {
      selected: de.home.selectedProjects,
      articles: de.articles.content,
      articlesMetadata: de.articles.metadata,
      selectedEyebrow: "Ausgewählte Artikel",
      selectedTitle: "Engineering-Artikel über Architektur und Entscheidungen.",
      readArticle: "Artikel lesen",
      viewArticle: "Artikel ansehen",
      technologies: "Technologien und Muster in {title}",
      pageName: "Engineering-Artikel von Ghassan Aldarwish",
      socialHeadline: "Systeme, Entwürfe und Referenzarchitekturen.",
      socialAction: "Artikel entdecken →",
      keywords: [
        "Artikel von Ghassan Aldarwish",
        "Software-Engineering-Artikel",
        "AI-Engineering-Artikel",
      ],
    },
    ar: {
      selected: ar.home.selectedProjects,
      articles: ar.articles.content,
      articlesMetadata: ar.articles.metadata,
      selectedEyebrow: "مقالات مختارة",
      selectedTitle: "مقالات هندسية تركز على المعمارية والقرارات.",
      readArticle: "قراءة المقال",
      viewArticle: "عرض المقال",
      technologies: "التقنيات والأنماط في {title}",
      pageName: "مقالات هندسية بقلم غسان الدرويش",
      socialHeadline: "أنظمة وتصاميم ومعماريات مرجعية.",
      socialAction: "استكشف المقالات ←",
      keywords: [
        "مقالات غسان الدرويش",
        "مقالات هندسة البرمجيات",
        "مقالات هندسة الذكاء الاصطناعي",
      ],
    },
  } as const

  it("uses article-neutral discovery labels across every locale", () => {
    for (const expected of Object.values(expectations)) {
      expect(expected.selected.eyebrow).toBe(expected.selectedEyebrow)
      expect(expected.selected.title).toBe(expected.selectedTitle)
      expect(expected.selected.readCaseStudy).toBe(expected.readArticle)
      expect(expected.selected.technologiesLabel).toBe(expected.technologies)
      expect(expected.articles.viewCaseStudy).toBe(expected.viewArticle)
      expect(expected.articles.technologiesLabel).toBe(expected.technologies)
      expect(expected.articlesMetadata.structuredData.pageName).toBe(
        expected.pageName
      )
      expect(expected.articlesMetadata.socialImage.alt).toBe(expected.pageName)
      expect(expected.articlesMetadata.socialImage.headline).toBe(
        expected.socialHeadline
      )
      expect(expected.articlesMetadata.socialImage.action).toBe(
        expected.socialAction
      )
      expect(expected.articlesMetadata.keywords.slice(0, 3)).toEqual(
        expected.keywords
      )
    }
  })

  it("uses article-neutral fallback copy for the articles social image", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/[locale]/articles/opengraph-image.tsx"),
      "utf-8"
    )

    expect(source).toContain(
      'export const alt = "Engineering articles by Ghassan Aldarwish"'
    )
    expect(source).not.toContain("Engineering systems and projects")
  })
})
