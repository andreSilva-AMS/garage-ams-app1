import { ImageResponse } from "next/og";

export const alt = "ReceptCar — Fini les litiges à la restitution du véhicule.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "80px",
          backgroundColor: "#0E0F11",
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(168,123,63,0.35), transparent 45%), radial-gradient(circle at 85% 80%, rgba(168,123,63,0.2), transparent 50%)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 700 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              color: "#A87B3F",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "-0.5px",
            }}
          >
            ReceptCar
          </div>
          <div
            style={{
              display: "flex",
              marginTop: "28px",
              fontSize: 56,
              fontWeight: 700,
              color: "#FFFFFF",
              lineHeight: 1.12,
              letterSpacing: "-1.5px",
            }}
          >
            Fini les litiges à la restitution du véhicule.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: "28px",
              fontSize: 24,
              color: "rgba(255,255,255,0.65)",
              maxWidth: 620,
            }}
          >
            Photos, dommages et signature du client en quelques minutes. Le PDF part automatiquement par e-mail.
          </div>
        </div>

        {/* Silhouette de smartphone, en écho au mockup animé du hero. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: 220,
            height: 440,
            borderRadius: 36,
            border: "3px solid rgba(255,255,255,0.18)",
            backgroundColor: "rgba(255,255,255,0.04)",
            padding: "18px 14px",
          }}
        >
          <div
            style={{
              width: 64,
              height: 18,
              borderRadius: 12,
              backgroundColor: "rgba(255,255,255,0.18)",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              marginTop: 28,
              width: "100%",
            }}
          >
            <div style={{ display: "flex", width: "70%", height: 12, borderRadius: 6, backgroundColor: "rgba(168,123,63,0.9)" }} />
            <div style={{ display: "flex", width: "90%", height: 12, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.12)" }} />
            <div style={{ display: "flex", width: "55%", height: 12, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.12)" }} />
            <div style={{ display: "flex", width: "80%", height: 12, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.12)" }} />
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
