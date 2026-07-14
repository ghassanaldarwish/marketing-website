import { describe, expect, it } from "vitest"

import {
  contactFormSchema,
  createContactFormSchema,
} from "@/features/contact/contact-schema"

const validContactInput = {
  name: "Test User",
  email: "test.user@example.test",
  message: "I would like to discuss a software engineering project.",
}

describe("contactFormSchema", () => {
  it("accepts valid input and trims every field", () => {
    const result = contactFormSchema.parse({
      name: "  Test User  ",
      email: "  test.user@example.test  ",
      message: "  This message is long enough to be accepted.  ",
    })

    expect(result).toEqual({
      name: "Test User",
      email: "test.user@example.test",
      message: "This message is long enough to be accepted.",
    })
  })

  it.each([
    ["name", { ...validContactInput, name: " A " }],
    ["email", { ...validContactInput, email: "not-an-email" }],
    ["message", { ...validContactInput, message: "Too short" }],
  ])("rejects invalid %s input", (field, input) => {
    const result = contactFormSchema.safeParse(input)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === field)).toBe(
        true
      )
    }
  })

  it("accepts the exact message length boundaries", () => {
    expect(
      contactFormSchema.safeParse({
        ...validContactInput,
        message: "a".repeat(10),
      }).success
    ).toBe(true)
    expect(
      contactFormSchema.safeParse({
        ...validContactInput,
        message: "a".repeat(5000),
      }).success
    ).toBe(true)
  })

  it("rejects a message longer than five thousand characters", () => {
    expect(
      contactFormSchema.safeParse({
        ...validContactInput,
        message: "a".repeat(5001),
      }).success
    ).toBe(false)
  })

  it("rejects missing and non-string fields", () => {
    expect(contactFormSchema.safeParse({}).success).toBe(false)
    expect(
      contactFormSchema.safeParse({
        name: 123,
        email: true,
        message: [],
      }).success
    ).toBe(false)
  })

  it("creates independent localized schemas", () => {
    const englishSchema = createContactFormSchema({
      nameMin: "Name must be at least 2 characters.",
      emailInvalid: "Please enter a valid email address.",
      messageMin: "Message must be at least 10 characters.",
      messageMax: "Message must be less than 5000 characters.",
    })
    const germanSchema = createContactFormSchema({
      nameMin: "Der Name muss mindestens 2 Zeichen lang sein.",
      emailInvalid: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
      messageMin: "Die Nachricht muss mindestens 10 Zeichen lang sein.",
      messageMax: "Die Nachricht darf höchstens 5000 Zeichen lang sein.",
    })

    const englishResult = englishSchema.safeParse({
      ...validContactInput,
      name: "A",
    })
    const germanResult = germanSchema.safeParse({
      ...validContactInput,
      name: "A",
    })

    expect(englishResult.success).toBe(false)
    expect(germanResult.success).toBe(false)

    if (!englishResult.success && !germanResult.success) {
      expect(englishResult.error.issues[0]?.message).toBe(
        "Name must be at least 2 characters."
      )
      expect(germanResult.error.issues[0]?.message).toBe(
        "Der Name muss mindestens 2 Zeichen lang sein."
      )
    }
  })
})
