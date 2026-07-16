import type { ComponentPropsWithoutRef, ReactNode } from "react"
import type { MDXComponents } from "mdx/types"

type CalloutProps = {
  title?: string
  children: ReactNode
}

function Callout({ title = "Note", children }: CalloutProps) {
  return (
    <aside className="mx-auto my-8 max-w-[70ch] rounded-xl border border-primary/25 bg-primary/5 p-5 text-start">
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
  h1: ({ children, ...props }: ComponentPropsWithoutRef<"h1">) => (
    <h1
      {...props}
      className="mx-auto mt-10 max-w-[70ch] text-start text-4xl font-semibold tracking-tight text-foreground sm:text-5xl"
    >
      {children}
    </h1>
  ),

  h2: ({ children, ...props }: ComponentPropsWithoutRef<"h2">) => (
    <h2
      {...props}
      className="mx-auto mt-14 max-w-[70ch] text-start text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
    >
      {children}
    </h2>
  ),

  h3: ({ children, ...props }: ComponentPropsWithoutRef<"h3">) => (
    <h3
      {...props}
      className="mx-auto mt-10 max-w-[70ch] text-start text-2xl font-semibold tracking-tight text-foreground"
    >
      {children}
    </h3>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mx-auto my-8 max-w-[70ch] border-s-2 border-blue-500 ps-6 text-start text-lg leading-8 text-muted-foreground italic">
      {children}
    </blockquote>
  ),

  table: ({ children }) => (
    <div
      data-article-table
      className="my-8 max-w-full overflow-x-auto overscroll-x-contain rounded-2xl border border-border"
    >
      <table className="w-full min-w-xl border-collapse text-start text-sm">
        {children}
      </table>
    </div>
  ),

  th: ({ children }) => (
    <th className="border-b border-border bg-muted/50 px-4 py-3 text-start font-medium text-foreground">
      {children}
    </th>
  ),

  td: ({ children }) => (
    <td className="border-b border-border px-4 py-3 text-start text-muted-foreground">
      {children}
    </td>
  ),
  p: ({ children }) => (
    <p className="mx-auto mt-5 max-w-[70ch] text-start text-lg leading-8 text-muted-foreground">
      {children}
    </p>
  ),

  ul: ({ children }) => (
    <ul className="mx-auto mt-6 max-w-[70ch] list-disc space-y-3 ps-6 text-start text-muted-foreground">
      {children}
    </ul>
  ),

  ol: ({ children }) => (
    <ol className="mx-auto mt-6 max-w-[70ch] list-decimal space-y-3 ps-6 text-start text-muted-foreground">
      {children}
    </ol>
  ),

  li: ({ children }) => <li className="ps-2 leading-8">{children}</li>,
} satisfies MDXComponents
