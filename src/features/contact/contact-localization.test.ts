import { describe, expect, it } from "vitest"

import ar from "../../../content/dictionaries/ar.json"
import de from "../../../content/dictionaries/contact/de.json"
import en from "../../../content/dictionaries/en.json"

describe("Contact form localization", () => {
  const forms = {
    en: en.contact.form,
    de,
    ar: ar.contact.form,
  } as const

  it("uses plain email examples without Markdown syntax", () => {
    for (const form of Object.values(forms)) {
      expect(form.fields.email.placeholder).toMatch(/^[^\s[\]()]+@[^\s[\]()]+$/)
    }
  })

  it("localizes the assistive honeypot label", () => {
    expect(forms.en.honeypotLabel).toBe("Leave this field empty")
    expect(forms.de.honeypotLabel).toBe("Dieses Feld leer lassen")
    expect(forms.ar.honeypotLabel).toBe("اترك هذا الحقل فارغًا")
  })
})
