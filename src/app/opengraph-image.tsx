import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";
export const alt = "Nudge — friendly invoice follow-up for busy tradies";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const goblin = readFileSync(
    join(process.cwd(), "public/brand/nudge-goblin.png")
  );
  const goblinSrc = `data:image/png;base64,${goblin.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#46b36b",
          color: "#ffffff",
          fontFamily: "Georgia, serif",
          padding: 80,
        }}
      >
        <img
          src={goblinSrc}
          width={180}
          height={180}
          alt=""
          style={{ borderRadius: 28, marginBottom: 28 }}
        />
        <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: -2 }}>
          nudge
        </div>
        <div style={{ fontSize: 34, marginTop: 8, opacity: 0.95 }}>
          Friendly invoice follow-up for busy tradies
        </div>
        <div
          style={{
            fontSize: 26,
            marginTop: 28,
            color: "#1e3d2b",
            background: "#f6f388",
            padding: "8px 18px",
            borderRadius: 12,
          }}
        >
          Free to send · 1% when you&apos;re paid
        </div>
      </div>
    ),
    { ...size }
  );
}
