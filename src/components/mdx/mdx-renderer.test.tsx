import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

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

const originalVercelEnvironment = process.env.VERCEL

describe("MdxRenderer", () => {
  beforeEach(() => {
    evaluateMock.mockReset()
    delete process.env.VERCEL
  })

  afterEach(() => {
    if (originalVercelEnvironment === undefined) {
      delete process.env.VERCEL
    } else {
      process.env.VERCEL = originalVercelEnvironment
    }
  })

  it("retries without syntax highlighting when local pretty-code evaluation fails", async () => {
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

  it("does not initialize pretty-code in the Vercel serverless runtime", async () => {
    process.env.VERCEL = "1"
    const MdxContent = () => null
    evaluateMock.mockResolvedValueOnce({ default: MdxContent })

    await expect(MdxRenderer({ source: "# Article" })).resolves.toBeDefined()

    expect(evaluateMock).toHaveBeenCalledTimes(1)
    expect(evaluateMock.mock.calls[0]?.[1].rehypePlugins).toHaveLength(2)
  })

  it("reports both highlighting and MDX failures when the fallback fails", async () => {
    const highlightingError = new Error("Shiki initialization failed")
    const mdxError = new Error("Invalid MDX")
    evaluateMock
      .mockRejectedValueOnce(highlightingError)
      .mockRejectedValueOnce(mdxError)

    try {
      await MdxRenderer({ source: "<Broken" })
      throw new Error("Expected MDX rendering to fail")
    } catch (error) {
      expect(error).toBeInstanceOf(AggregateError)
      expect((error as AggregateError).errors).toEqual([
        highlightingError,
        mdxError,
      ])
    }
  })
})
