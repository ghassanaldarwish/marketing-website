import { ImageResponse } from "next/og"

import type { ArticleMetadata } from "@/lib/mdx/article-schema"

export const socialImageSize = {
  width: 1200,
  height: 630,
}

type CreateArticleSocialImageOptions = {
  metadata: ArticleMetadata
}

export function createArticleSocialImage({
  metadata,
}: CreateArticleSocialImageOptions) {
  const primaryTag = metadata.tags[0] ?? "Software Engineering"

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px",
        background:
          "linear-gradient(135deg, #09090b 0%, #18181b 55%, #27272a 100%)",
        color: "#fafafa",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            padding: "10px 18px",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "999px",
            fontSize: "24px",
            color: "#d4d4d8",
          }}
        >
          {primaryTag}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "24px",
            color: "#a1a1aa",
          }}
        >
          ghassan.de
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: "64px",
            lineHeight: 1.08,
            fontWeight: 700,
            letterSpacing: "-2px",
          }}
        >
          {metadata.title}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "24px",
            maxWidth: "920px",
            fontSize: "28px",
            lineHeight: 1.4,
            color: "#a1a1aa",
          }}
        >
          {metadata.description}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid rgba(255,255,255,0.14)",
          paddingTop: "28px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "25px",
              fontWeight: 600,
            }}
          >
            Ghassan Aldarwish
          </div>

          <div
            style={{
              display: "flex",
              marginTop: "5px",
              fontSize: "20px",
              color: "#a1a1aa",
            }}
          >
            AI Engineer · Backend Engineer
          </div>
        </div>

        <div
          style={{
            display: "flex",
            padding: "12px 20px",
            borderRadius: "10px",
            background: "#fafafa",
            color: "#18181b",
            fontSize: "22px",
            fontWeight: 600,
          }}
        >
          Read the article →
        </div>
      </div>
    </div>,
    socialImageSize
  )
}
