import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/*": ["./content/articles/**/*"],
  },
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
   * Enable this only when deploying with Docker using
   * Next.js standalone output.
   */
  // output: "standalone",
}

export default withNextIntl(nextConfig)
