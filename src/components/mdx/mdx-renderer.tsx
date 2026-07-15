import "server-only"

import type { EvaluateOptions } from "@mdx-js/mdx"
import type { MDXComponents } from "mdx/types"
import type { Options as PrettyCodeOptions } from "rehype-pretty-code"

import { evaluate } from "@mdx-js/mdx"
import * as runtime from "react/jsx-runtime"

import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypePrettyCode from "rehype-pretty-code"

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
  let evaluatedMdx

  try {
    evaluatedMdx = await evaluateMdx(source, true)
  } catch (error) {
    // Shiki-based syntax highlighting may fail to initialize in constrained
    // serverless runtimes. Preserve article availability by retrying without
    // the optional highlighting plugin. Invalid MDX still fails on the retry.
    evaluatedMdx = await evaluateMdx(source, false).catch(() => {
      throw error
    })
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
