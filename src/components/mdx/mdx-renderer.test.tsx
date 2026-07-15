import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

const evaluateMock = vi.fn()

vi.mock("@mdx-js/mdx", () => ({
  evaluate: evaluateMock,
}))

vi.mock("react/jsx-runtime", () => ({
  Fragment: Symbol.for("react.fragment"),
  jsx: vi.fn(),
  jsxs: vi.fn(),
}))

import { MdxRenderer } from "@/components/mdx/mdx-renderer"

describe("MdxRenderer", () => {
  beforeEach(() => {
    evaluateMock.mockReset()
  })

  it("retries without syntax highlighting when pretty-code evaluation fails", async () => {
    const MdxContent = () => null
    evaluateMock
      .mockRejectedValueOnce(new Error("Shiki initialization failed"))
      .mockResolvedValueOnce({ default: MdxContent })

    await expect(MdxRenderer({ source: "# Article" })).resolves.toBeDefined()

    expect(evaluateMock).toHaveBeenCalledTimes(2)

    const firstOptions = evaluateMock.mock.calls[0]?.[1]
    const secondOptions = evaluateMock.mock.calls[1]?.[1]

    expect(firstOptions.rehypePlugins).toHaveLength(3)
    expect(secondOptions.rehypePlugins).toHaveLength(2)
  })

  it("preserves the original MDX error when the fallback also fails", async () => {
    const originalError = new Error("Invalid MDX")
    evaluateMock
      .mockRejectedValueOnce(originalError)
      .mockRejectedValueOnce(new Error("Fallback failed"))

    await expect(MdxRenderer({ source: "<Broken" })).rejects.toBe(originalError)
  })
})
