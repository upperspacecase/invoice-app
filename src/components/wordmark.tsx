// Shared Nudge wordmark — yellow sunburst rays above the "u". Two sizes:
// "lg" (landing nav), "sm" (signin header + app header).

export function Wordmark({ size = "lg" }: { size?: "lg" | "sm" }) {
  const fontSize = size === "lg" ? 34 : 20;
  const burst =
    size === "lg"
      ? { w: 22, h: 18, top: -4, left: 18, sw: 1.8 }
      : { w: 14, h: 12, top: -3, left: 11, sw: 2.4 };
  const showSideRays = size === "lg";
  return (
    <div
      className="relative inline-flex"
      style={{ paddingTop: size === "lg" ? 8 : 4 }}
    >
      <svg
        aria-hidden
        width={burst.w}
        height={burst.h}
        viewBox="0 0 22 18"
        style={{ position: "absolute", top: burst.top, left: burst.left }}
      >
        <g stroke="#f3b81f" strokeWidth={burst.sw} strokeLinecap="round" fill="none">
          <line x1="11" y1="2" x2="11" y2="7" />
          <line x1="4" y1="4" x2="7" y2="7.5" />
          <line x1="18" y1="4" x2="15" y2="7.5" />
          {showSideRays && (
            <>
              <line x1="2" y1="11" x2="5" y2="11" />
              <line x1="17" y1="11" x2="20" y2="11" />
            </>
          )}
        </g>
      </svg>
      <span
        className="font-serif"
        style={{
          fontWeight: 700,
          fontSize,
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
      >
        Nudge
      </span>
    </div>
  );
}
