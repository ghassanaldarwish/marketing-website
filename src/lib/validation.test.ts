import { describe, expect, it } from "vitest"

import { contactFormSchema } from "@/lib/validation"

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
    const result = contactFormSchema.safeParse({
      ...validContactInput,
      message: "a".repeat(5001),
    })

    expect(result.success).toBe(false)
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
})
