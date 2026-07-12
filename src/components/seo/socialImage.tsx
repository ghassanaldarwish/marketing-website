// components/seo/SocialImage.tsx

type SocialImageProps = {
  badge: string
  headline: string
  description: string
  role: string
  action: string
  direction?: "ltr" | "rtl"
}

export function SocialImage({
  badge,
  headline,
  description,
  role,
  action,
  direction = "ltr",
}: SocialImageProps) {
  return (
    <div
      dir={direction}
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
        textAlign: direction === "rtl" ? "right" : "left",
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
          {badge}
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
          maxWidth: "1060px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: "69px",
            lineHeight: 1.04,
            fontWeight: 700,
            letterSpacing: direction === "rtl" ? "0" : "-2px",
          }}
        >
          {headline}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "28px",
            maxWidth: "960px",
            color: "#a1a1aa",
            fontSize: "29px",
            lineHeight: 1.4,
          }}
        >
          {description}
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
              fontSize: "26px",
              fontWeight: 600,
            }}
          >
            Ghassan Aldarwish
          </div>

          <div
            style={{
              display: "flex",
              marginTop: "6px",
              color: "#a1a1aa",
              fontSize: "20px",
            }}
          >
            {role}
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
          {action}
        </div>
      </div>
    </div>
  )
}
