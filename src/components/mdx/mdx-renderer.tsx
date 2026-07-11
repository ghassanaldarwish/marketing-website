import "server-only"

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

export async function MdxRenderer({ source, components }: MdxRendererProps) {
  const { default: MdxContent } = await evaluate(source, {
    ...runtime,

    format: "mdx",

    remarkPlugins: [remarkGfm],

    rehypePlugins: [
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

      [rehypePrettyCode, prettyCodeOptions],
    ],
  })

  return (
    <MdxContent
      components={{
        ...mdxComponents,
        ...components,
      }}
    />
  )
}
