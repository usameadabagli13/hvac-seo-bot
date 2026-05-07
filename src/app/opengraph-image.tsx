import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "HeatRank AI — Local SEO Tools for HVAC Contractors";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #09090b 0%, #18181b 100%)",
          color: "#fafafa",
          padding: 80,
          position: "relative",
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -200,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 800,
              color: "#0a0a0a",
            }}
          >
            H
          </div>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 600 }}>
            <span style={{ color: "#fafafa" }}>HeatRank</span>
            <span style={{ color: "#a1a1aa", marginLeft: 6 }}>AI</span>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 80,
            maxWidth: 900,
          }}
        >
          <div
            style={{
              fontSize: 28,
              color: "#a1a1aa",
              marginBottom: 16,
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            Local SEO for HVAC Contractors
          </div>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              color: "#fafafa",
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            Rank higher.{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #fbbf24 0%, #f97316 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                marginLeft: 16,
              }}
            >
              Win more calls.
            </span>
          </div>
        </div>

        {/* Footer trust strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 32,
            marginTop: "auto",
            color: "#71717a",
            fontSize: 22,
          }}
        >
          <span>14-day free trial</span>
          <span style={{ color: "#3f3f46" }}>·</span>
          <span>No credit card</span>
          <span style={{ color: "#3f3f46" }}>·</span>
          <span>Cancel anytime</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
