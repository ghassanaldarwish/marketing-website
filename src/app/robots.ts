import type { MetadataRoute } from "next"

import {
  absoluteUrl,
  isProductionDeployment,
  siteConfig,
} from "@/lib/config/site"

export default function robots(): MetadataRoute.Robots {
  if (!isProductionDeployment) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    }
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },

    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteConfig.url.origin,
  }
}
