// Nudge wordmark — Bricolage Grotesque 800 + 5-ray green spark fan
// radiating from a point above the "u". Two sizes: "lg"
// (landing nav, prominent), "sm" (signin/app header, footer).

type Size = "lg" | "sm";

const SCALE: Record<Size, { font: number; burst: number; offsetTop: number; padTop: number }> = {
  lg: { font: 38, burst: 26, offsetTop: -10, padTop: 12 },
  sm: { font: 22, burst: 16, offsetTop: -6, padTop: 7 },
};

export function Wordmark({ size = "lg" }: { size?: Size }) {
  const s = SCALE[size];
  // Centre of burst sits above the "u" — roughly 28% from the left edge
  // of the wordmark for "Nudge".
  const burstLeftPct = "26%";

  return (
    <div
      className="relative inline-flex"
      style={{ paddingTop: s.padTop }}
    >
      <SunburstFan
        size={s.burst}
        style={{
          position: "absolute",
          top: s.offsetTop,
          left: burstLeftPct,
          transform: "translateX(-50%)",
        }}
      />
      <span
        className="font-display"
        style={{
          fontWeight: 800,
          fontSize: s.font,
          letterSpacing: "-0.035em",
          lineHeight: 1,
        }}
      >
        Nudge
      </span>
    </div>
  );
}

// 5-ray fan: centre vertical + two mid + two outer rays. All radiate
// upward from a point just below the bottom of the viewBox so the burst
// reads as "emerging from" the letter below.
function SunburstFan({
  size,
  style,
}: {
  size: number;
  style?: React.CSSProperties;
}) {
  // Rays are drawn from a single origin (cx=14, cy=18) toward 5 endpoints.
  // Angles, measured from vertical: -55°, -28°, 0°, +28°, +55°.
  // Length is constant; line caps are rounded.
  return (
    <svg
      aria-hidden
      width={size}
      height={(size * 18) / 28}
      viewBox="0 0 28 18"
      style={style}
    >
      <g
        stroke="var(--color-paid)"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      >
        {/* centre */}
        <line x1="14" y1="16" x2="14" y2="3" />
        {/* mid left + right (~28° from vertical) */}
        <line x1="14" y1="16" x2="8" y2="5" />
        <line x1="14" y1="16" x2="20" y2="5" />
        {/* outer left + right (~55° from vertical) */}
        <line x1="14" y1="16" x2="3" y2="8" />
        <line x1="14" y1="16" x2="25" y2="8" />
      </g>
    </svg>
  );
}
