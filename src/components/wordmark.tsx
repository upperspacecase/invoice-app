// Nudge wordmark — the exact brand logotype (Recoleta + green spark), used as
// an image since Recoleta isn't a free webfont. `tone="light"` whitens it for
// dark backgrounds.
import Image from "next/image";

type Size = "lg" | "sm";

const HEIGHT: Record<Size, number> = { lg: 30, sm: 20 };
const RATIO = 318 / 86; // intrinsic aspect of nudge-wordmark.png

export function Wordmark({
  size = "lg",
  tone = "dark",
}: {
  size?: Size;
  tone?: "dark" | "light";
}) {
  const h = HEIGHT[size];
  return (
    <Image
      src="/brand/nudge-wordmark.png"
      alt="Nudge"
      width={Math.round(h * RATIO)}
      height={h}
      priority={size === "lg"}
      style={{
        height: h,
        width: "auto",
        ...(tone === "light"
          ? { filter: "brightness(0) invert(1)" }
          : null),
      }}
    />
  );
}
