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

const commonRehypePlugins: NonNullable<EvaluateOptions["rehypePlugins"]> = [
  rehypeSlug,
  [
    rehypeAutolinkHeadings,
    {
      behavior: "append",
      properties: {
        className: ["heading-anchor"],
        ariaLabel: "Link to this section",
      },
      content: {
        type: "text",
        value: "#",
      },
    },
  ],
]

async function evaluateMdx(source: string, withPrettyCode: boolean) {
  const rehypePlugins: NonNullable<EvaluateOptions["rehypePlugins"]> = [
    ...commonRehypePlugins,
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

export async function MdxRenderer({ source, components }: MdxRendererProps) {
  const shouldUsePrettyCode = process.env.VERCEL !== "1"
  let evaluatedMdx

  try {
    evaluatedMdx = await evaluateMdx(source, shouldUsePrettyCode)
  } catch (highlightingError) {
    if (!shouldUsePrettyCode) {
      throw highlightingError
    }

    try {
      evaluatedMdx = await evaluateMdx(source, false)
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
