import type { ComponentPropsWithoutRef, ReactNode } from "react"
import type { MDXComponents } from "mdx/types"

type CalloutProps = {
  title?: string
  children: ReactNode
}

function Callout({ title = "Note", children }: CalloutProps) {
  return (
    <aside className="my-8 rounded-xl border border-primary/25 bg-primary/5 p-5">
      <p className="m-0 font-semibold text-foreground">{title}</p>

      <div className="mt-2 text-muted-foreground">{children}</div>
    </aside>
  )
}

function MdxLink({
  href = "",
  children,
  ...props
}: ComponentPropsWithoutRef<"a">) {
  const isExternal = href.startsWith("https://") || href.startsWith("http://")

  return (
    <a
      {...props}
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer noopener" : undefined}
    >
      {children}
    </a>
  )
}

function MdxImage(props: ComponentPropsWithoutRef<"img">) {
  return (
    // Markdown images normally do not provide dimensions.
    // Use the custom Image component shown below when dimensions are known.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      alt={props.alt ?? ""}
      loading="lazy"
      className="rounded-xl border border-border"
    />
  )
}

export const mdxComponents = {
  a: MdxLink,
  img: MdxImage,
  Callout,
  h1: ({ children }) => (
    <h1 className="mt-10 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
      {children}
    </h1>
  ),

  h2: ({ children }) => (
    <h2 className="mt-16 pt-10 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
      {children}
    </h2>
  ),

  h3: ({ children }) => (
    <h3 className="mt-10 text-2xl font-semibold tracking-tight text-foreground">
      {children}
    </h3>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-8 border-l-2 border-blue-500 pl-6 text-lg leading-8 text-muted-foreground italic">
      {children}
    </blockquote>
  ),

  table: ({ children }) => (
    <div className="my-8 overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-xl border-collapse text-sm">
        {children}
      </table>
    </div>
  ),

  th: ({ children }) => (
    <th className="border-b border-border bg-muted/50 px-4 py-3 text-left font-medium text-foreground">
      {children}
    </th>
  ),

  td: ({ children }) => (
    <td className="border-b border-border px-4 py-3 text-muted-foreground">
      {children}
    </td>
  ),
  p: ({ children }) => (
    <p className="mt-5 text-lg leading-8 text-muted-foreground">{children}</p>
  ),

  ul: ({ children }) => (
    <ul className="mt-6 list-disc space-y-3 pl-6 text-muted-foreground">
      {children}
    </ul>
  ),

  ol: ({ children }) => (
    <ol className="mt-6 list-decimal space-y-3 pl-6 text-muted-foreground">
      {children}
    </ol>
  ),

  li: ({ children }) => <li className="pl-2 leading-8">{children}</li>,
} satisfies MDXComponents

/**
 * This also makes the file compatible with @next/mdx if you decide
 * to use direct local MDX imports later.
 */
export function useMDXComponents(): MDXComponents {
  return mdxComponents
}
