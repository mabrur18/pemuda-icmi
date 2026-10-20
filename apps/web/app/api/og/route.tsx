import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title") || "Pemuda ICMI Kota Bekasi";
    const category = searchParams.get("category") || "Portal Cendekia Muda";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px 80px",
            backgroundColor: "#0B4632",
            backgroundImage: "radial-gradient(circle at 25px 25px, #135D43 2%, transparent 0%), radial-gradient(circle at 75px 75px, #135D43 2%, transparent 0%)",
            backgroundSize: "100px 100px",
            fontFamily: "sans-serif",
          }}
        >
          {/* Header Bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "28px",
                  backgroundColor: "#D4AF37",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0B4632",
                  fontSize: "28px",
                  fontWeight: 900,
                }}
              >
                IC
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "24px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.5px" }}>
                  Pemuda ICMI
                </span>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#D4AF37", letterSpacing: "1px", textTransform: "uppercase" }}>
                  Kota Bekasi
                </span>
              </div>
            </div>

            <div
              style={{
                padding: "8px 20px",
                borderRadius: "30px",
                backgroundColor: "rgba(212, 175, 55, 0.15)",
                border: "1px solid #D4AF37",
                color: "#D4AF37",
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              {category}
            </div>
          </div>

          {/* Main Title */}
          <div style={{ display: "flex", flexDirection: "column", margin: "40px 0" }}>
            <h1
              style={{
                fontSize: title.length > 60 ? "46px" : "56px",
                fontWeight: 900,
                color: "#FFFFFF",
                lineHeight: 1.25,
                margin: 0,
                letterSpacing: "-1px",
              }}
            >
              {title}
            </h1>
          </div>

          {/* Footer Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "2px solid rgba(255, 255, 255, 0.15)",
              paddingTop: "24px",
            }}
          >
            <span style={{ fontSize: "18px", color: "rgba(255, 255, 255, 0.7)", fontWeight: 500 }}>
              pemudaicmi-kotabekasi.org
            </span>
            <span style={{ fontSize: "16px", color: "#D4AF37", fontWeight: 700 }}>
              Intelektual · Madani · Berintegritas
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate image: ${e.message}`, { status: 500 });
  }
}
