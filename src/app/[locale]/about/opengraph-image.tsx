import { ImageResponse } from "next/og"

import { siteConfig } from "@/lib/site"

export const alt = "Ghassan Aldarwish — AI Engineer and Backend Engineer"

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

export default function OpenGraphImage() {
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
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            padding: "10px 18px",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "999px",
            color: "#d4d4d8",
            fontSize: "23px",
          }}
        >
          About Me
        </div>

        <div
          style={{
            display: "flex",
            color: "#a1a1aa",
            fontSize: "23px",
          }}
        >
          ghassan.de
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "1050px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: "68px",
            lineHeight: 1.05,
            fontWeight: 700,
            letterSpacing: "-2px",
          }}
        >
          Ghassan Aldarwish
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "20px",
            fontSize: "34px",
            color: "#d4d4d8",
          }}
        >
          AI Engineer · Backend Engineer
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "28px",
            maxWidth: "940px",
            fontSize: "27px",
            lineHeight: 1.4,
            color: "#a1a1aa",
          }}
        >
          Building production AI systems, scalable backend platforms and
          cloud-native software.
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
            fontSize: "23px",
            color: "#a1a1aa",
          }}
        >
          Node.js · TypeScript · Python · AI Systems
        </div>

        <div
          style={{
            display: "flex",
            padding: "12px 20px",
            borderRadius: "10px",
            background: "#fafafa",
            color: "#18181b",
            fontSize: "21px",
            fontWeight: 600,
          }}
        >
          Explore my journey →
        </div>
      </div>
    </div>,
    size
  )
}
