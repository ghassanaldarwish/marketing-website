import type { NextConfig } from "next"
import createMDX from "@next/mdx"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,

  options: {
    remarkPlugins: [
      "remark-gfm",

      // Enable YAML frontmatter for directly imported MDX files.
      "remark-frontmatter",

      // Export YAML frontmatter as:
      // export const metadata = { ... }
      [
        "remark-mdx-frontmatter",
        {
          name: "metadata",
        },
      ],
    ],

    rehypePlugins: [
      "rehype-slug",

      [
        "rehype-autolink-headings",
        {
          behavior: "wrap",
        },
      ],

      [
        "rehype-pretty-code",
        {
          theme: {
            light: "github-light",
            dark: "github-dark",
          },
          keepBackground: false,
          defaultLang: "plaintext",
        },
      ],
    ],
  },
})

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        port: "",
        pathname:
          "/ghassanaldarwish/marketing-website-remote-content/main/assets/**",
      },
    ],
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },

  /**
   * Enable these only when deploying with Docker using
   * Next.js standalone output.
   */
  // output: "standalone",
  // outputFileTracingIncludes: {
  //   "/*": ["./content/**/*"],
  // },
}

export default withMDX(withNextIntl(nextConfig))
