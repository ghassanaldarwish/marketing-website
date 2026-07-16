import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { ReactElement } from "react"
import type { MDXComponents } from "mdx/types"

vi.mock("server-only", () => ({}))

const { evaluateMock } = vi.hoisted(() => ({
  evaluateMock: vi.fn(),
}))

vi.mock("@mdx-js/mdx", () => ({
  evaluate: evaluateMock,
}))

vi.mock("react/jsx-runtime", () => ({
  Fragment: Symbol.for("react.fragment"),
  jsx: vi.fn(),
  jsxs: vi.fn(),
}))

import { MdxRenderer } from "@/components/mdx/mdx-renderer"
import { mdxComponents } from "@/mdx-components"

const originalVercelEnvironment = process.env.VERCEL
const headingAnchorLabel = "Link to this section"

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

    await expect(
      MdxRenderer({ source: "# Article", headingAnchorLabel })
    ).resolves.toBeDefined()

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

    await expect(
      MdxRenderer({ source: "# Article", headingAnchorLabel })
    ).resolves.toBeDefined()

    expect(evaluateMock).toHaveBeenCalledTimes(1)
    expect(evaluateMock.mock.calls[0]?.[1].rehypePlugins).toHaveLength(2)
  })

  it("uses the shared component map for every dynamically loaded article", async () => {
    const MdxContent = () => null
    const CustomCallout = () => null
    evaluateMock.mockResolvedValueOnce({ default: MdxContent })

    const rendered = (await MdxRenderer({
      source: "# Remote or hybrid fixture\n\n| A | B |\n| - | - |\n| 1 | 2 |",
      headingAnchorLabel,
      components: { Callout: CustomCallout },
    })) as ReactElement<{ components: MDXComponents }>

    expect(evaluateMock).toHaveBeenCalledWith(
      expect.stringContaining("Remote or hybrid fixture"),
      expect.objectContaining({ format: "mdx" })
    )
    expect(rendered.props.components).toEqual({
      ...mdxComponents,
      Callout: CustomCallout,
    })
  })

  it("passes the active locale's heading-anchor label to MDX", async () => {
    const MdxContent = () => null
    evaluateMock.mockResolvedValueOnce({ default: MdxContent })

    await MdxRenderer({
      source: "## Abschnitt",
      headingAnchorLabel: "Link zu diesem Abschnitt",
    })

    expect(evaluateMock.mock.calls[0]?.[1].rehypePlugins[1]).toEqual([
      expect.any(Function),
      expect.objectContaining({
        properties: expect.objectContaining({
          ariaLabel: "Link zu diesem Abschnitt",
        }),
      }),
    ])
  })

  it("reports both highlighting and MDX failures when the fallback fails", async () => {
    const highlightingError = new Error("Shiki initialization failed")
    const mdxError = new Error("Invalid MDX")
    evaluateMock
      .mockRejectedValueOnce(highlightingError)
      .mockRejectedValueOnce(mdxError)

    try {
      await MdxRenderer({ source: "<Broken", headingAnchorLabel })
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
