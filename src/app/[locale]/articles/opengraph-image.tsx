import { ImageResponse } from "next/og"

export const alt = "Engineering systems and projects by Ghassan Aldarwish"

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
          alignItems: "center",
          justifyContent: "space-between",
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
          Engineering
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
            fontSize: "66px",
            lineHeight: 1.06,
            fontWeight: 700,
            letterSpacing: "-2px",
          }}
        >
          Systems built beyond the code.
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "26px",
            maxWidth: "950px",
            color: "#a1a1aa",
            fontSize: "29px",
            lineHeight: 1.4,
          }}
        >
          AI platforms, backend architectures, automation workflows and cloud
          infrastructure designed for production.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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
              color: "#a1a1aa",
              fontSize: "20px",
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
          Explore the systems →
        </div>
      </div>
    </div>,
    size
  )
}
