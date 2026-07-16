import { describe, expect, it } from "vitest"

import ar from "../../content/dictionaries/ar.json"
import de from "../../content/dictionaries/de.json"
import en from "../../content/dictionaries/en.json"

const positioning = {
  en: {
    messages: en,
    roles: ["Backend Developer", "DevOps Engineer", "Junior AI Developer"],
    outdatedRolePattern: /\b(?:AI Engineer|Backend Engineer)\b/,
  },
  de: {
    messages: de,
    roles: ["Backend-Entwickler", "DevOps Engineer", "Junior-KI-Entwickler"],
    outdatedRolePattern: /\b(?:AI Engineer|Backend Engineer)\b/,
  },
  ar: {
    messages: ar,
    roles: ["مطور أنظمة خلفية", "مهندس DevOps", "مطور ذكاء اصطناعي مبتدئ"],
    outdatedRolePattern: /مهندس (?:ذكاء اصطناعي|أنظمة خلفية)/,
  },
} as const

describe("professional positioning", () => {
  for (const [
    locale,
    { messages, roles, outdatedRolePattern },
  ] of Object.entries(positioning)) {
    it(`uses the approved role hierarchy on ${locale} identity surfaces`, () => {
      expect(messages.home.hero.badge).toEqual(roles)
      expect(messages.home.metadata.structuredData.jobTitles).toEqual(roles)
      expect(messages.contact.metadata.structuredData.jobTitles).toEqual(roles)
      expect(messages.about.metadata.structuredData.jobTitles).toEqual(roles)

      const identityCopy = [
        messages.brand.role,
        messages.metadata.defaultTitle,
        messages.metadata.description,
        messages.metadata.socialImageAlt,
        messages.home.metadata.title,
        messages.home.metadata.description,
        messages.home.metadata.socialImage.alt,
        messages.home.metadata.socialImage.role,
        messages.home.metadata.socialImage.twitterRole,
        messages.home.metadata.structuredData.personDescription,
        messages.contact.metadata.structuredData.personDescription,
        messages.contact.metadata.socialImage.alt,
        messages.contact.metadata.socialImage.role,
        messages.about.metadata.description,
        messages.about.metadata.structuredData.personDescription,
        messages.about.metadata.socialImage.alt,
        messages.about.metadata.socialImage.role,
        messages.articles.metadata.socialImage.role,
      ]

      for (const value of identityCopy) {
        for (const role of roles) {
          expect(value).toContain(role)
        }

        expect(value).not.toMatch(outdatedRolePattern)
      }
    })
  }
})
