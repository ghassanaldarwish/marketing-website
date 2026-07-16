import "server-only"

import type { EvaluateOptions } from "@mdx-js/mdx"
import type { MDXComponents } from "mdx/types"
import type { Options as PrettyCodeOptions } from "rehype-pretty-code"

import { evaluate } from "@mdx-js/mdx"
import * as runtime from "react/jsx-runtime"

import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"

import { mdxComponents } from "@/mdx-components"

type MdxRendererProps = {
  source: string
  headingAnchorLabel: string
  components?: MDXComponents
}

const prettyCodeOptions = {
  theme: {
    light: "github-light",
    dark: "github-dark",
  },
  keepBackground: false,
  defaultLang: "plaintext",
} satisfies PrettyCodeOptions

function createCommonRehypePlugins(
  headingAnchorLabel: string
): NonNullable<EvaluateOptions["rehypePlugins"]> {
  return [
    rehypeSlug,
    [
      rehypeAutolinkHeadings,
      {
        behavior: "append",
        properties: {
          className: ["heading-anchor"],
          ariaLabel: headingAnchorLabel,
        },
        content: {
          type: "text",
          value: "#",
        },
      },
    ],
  ]
}

async function evaluateMdx(
  source: string,
  withPrettyCode: boolean,
  headingAnchorLabel: string
) {
  const rehypePlugins: NonNullable<EvaluateOptions["rehypePlugins"]> = [
    ...createCommonRehypePlugins(headingAnchorLabel),
  ]

  if (withPrettyCode) {
    const { default: rehypePrettyCode } = await import("rehype-pretty-code")
    rehypePlugins.push([rehypePrettyCode, prettyCodeOptions])
  }

  return evaluate(source, {
    ...runtime,
    format: "mdx",
    remarkPlugins: [remarkGfm],
    rehypePlugins,
  })
}

/**
 * Canonical article compilation boundary.
 *
 * MDX is executable application code. Only pass author-controlled content from
 * the configured local or remote article repositories to this renderer. If an
 * untrusted publishing source is introduced, render sanitized Markdown instead
 * of evaluating it as MDX.
 */
export async function MdxRenderer({
  source,
  headingAnchorLabel,
  components,
}: MdxRendererProps) {
  const shouldUsePrettyCode = process.env.VERCEL !== "1"
  let evaluatedMdx

  try {
    evaluatedMdx = await evaluateMdx(
      source,
      shouldUsePrettyCode,
      headingAnchorLabel
    )
  } catch (highlightingError) {
    if (!shouldUsePrettyCode) {
      throw highlightingError
    }

    try {
      evaluatedMdx = await evaluateMdx(source, false, headingAnchorLabel)
    } catch (mdxError) {
      throw new AggregateError(
        [highlightingError, mdxError],
        "MDX evaluation failed with and without syntax highlighting."
      )
    }
  }

  const MdxContent = evaluatedMdx.default

  return (
    <MdxContent
      components={{
        ...mdxComponents,
        ...components,
      }}
    />
  )
}
