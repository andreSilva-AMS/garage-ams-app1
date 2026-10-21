import { ImageResponse } from "next/og";

export const alt = "ReceptCar — Réception véhicule digitale pour garages";
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
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#0E0F11",
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(168,123,63,0.35), transparent 45%), radial-gradient(circle at 85% 80%, rgba(168,123,63,0.2), transparent 50%)",
        }}
      >
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
            fontSize: 64,
            fontWeight: 700,
            color: "#FFFFFF",
            lineHeight: 1.1,
            letterSpacing: "-1.5px",
            maxWidth: 920,
          }}
        >
          Chaque véhicule reçu. Chaque détail prouvé.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: "28px",
            fontSize: 26,
            color: "rgba(255,255,255,0.65)",
            maxWidth: 820,
          }}
        >
          La réception véhicule digitale pour garages et dépôts-ventes.
        </div>
      </div>
    ),
    { ...size },
  );
}
