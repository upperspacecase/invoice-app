import Link from "next/link";

export function ClosingCTA() {
  return (
    <section className="px-6 sm:px-10 lg:px-14 pb-16">
      <div
        className="max-w-6xl mx-auto rounded-3xl p-8 sm:p-10 flex flex-wrap items-center gap-8 relative overflow-hidden"
        style={{ background: "var(--color-cream-deep)" }}
      >
        {/* sparkles */}
        <svg
          aria-hidden
          width="28"
          height="28"
          viewBox="0 0 28 28"
          className="absolute"
          style={{ top: 24, left: "38%" }}
        >
          <path
            d="M 14 4 L 15.6 11.4 L 23 13 L 15.6 14.6 L 14 22 L 12.4 14.6 L 5 13 L 12.4 11.4 Z"
            fill="var(--color-coral)"
            opacity="0.9"
          />
        </svg>
        <svg
          aria-hidden
          width="14"
          height="14"
          viewBox="0 0 14 14"
          className="absolute"
          style={{ top: 50, left: "32%" }}
        >
          <path
            d="M 7 2 L 7.8 5.5 L 11 6 L 7.8 6.5 L 7 10 L 6.2 6.5 L 3 6 L 6.2 5.5 Z"
            fill="var(--color-coral)"
            opacity="0.7"
          />
        </svg>

        <div className="flex-1 min-w-[260px]">
          <h2
            className="font-serif leading-tight tracking-tight"
            style={{
              fontWeight: 700,
              fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
            }}
          >
            Let the invoice go.
            <br />
            We&apos;ll do{" "}
            <span className="relative inline-block">
              the nudging
              <Underline color="var(--color-coral)" />
            </span>
            .
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <BoomerangMascot />
          <div className="flex flex-col items-center gap-2">
            <Link
              href="/signin"
              className="px-8 h-12 inline-flex items-center justify-center rounded-xl text-paper text-sm font-semibold transition-colors"
              style={{ background: "var(--color-coral)" }}
            >
              Start free
            </Link>
            <div
              className="text-[11px] italic"
              style={{ color: "var(--color-coral-deep)" }}
            >
              No credit card required
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Friendly coral boomerang mid-flight with a small face. Two stripe details
// reinforce the boomerang shape; the dashed trail behind suggests motion;
// little sparkles at the ends imply "magic returning to you."
function BoomerangMascot() {
  return (
    <svg
      aria-hidden
      width="120"
      height="100"
      viewBox="0 0 120 100"
      style={{ flexShrink: 0 }}
    >
      <g transform="rotate(-15 60 50)">
        <path
          d="M 20 50 Q 30 20, 60 25 Q 90 30, 95 60 Q 85 50, 70 50 Q 55 50, 50 65 Q 35 65, 20 50 Z"
          fill="var(--color-coral-soft)"
          stroke="var(--color-coral-deep)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M 55 30 Q 65 32, 72 38"
          stroke="var(--color-coral-deep)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 58 60 Q 65 60, 70 58"
          stroke="var(--color-coral-deep)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="38" cy="42" r="2.5" fill="var(--color-ink)" />
        <circle cx="48" cy="42" r="2.5" fill="var(--color-ink)" />
        <path
          d="M 36 48 Q 43 53, 50 48"
          stroke="var(--color-ink)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="34" cy="48" r="2" fill="var(--color-coral-deep)" opacity="0.4" />
        <circle cx="52" cy="48" r="2" fill="var(--color-coral-deep)" opacity="0.4" />
      </g>
      <path
        d="M 105 40 Q 110 50, 115 70 Q 105 80, 95 90"
        stroke="rgba(10,10,10,0.25)"
        strokeWidth="1.2"
        strokeDasharray="3 4"
        strokeLinecap="round"
        fill="none"
      />
      <g fill="var(--color-coral)">
        <path d="M 10 20 L 11 23 L 14 24 L 11 25 L 10 28 L 9 25 L 6 24 L 9 23 Z" />
        <path d="M 100 12 L 100.8 14 L 103 15 L 100.8 16 L 100 18 L 99.2 16 L 97 15 L 99.2 14 Z" />
      </g>
    </svg>
  );
}

function Underline({ color }: { color: string }) {
  return (
    <svg
      aria-hidden
      width="100%"
      height="8"
      viewBox="0 0 200 8"
      preserveAspectRatio="none"
      className="absolute left-0 right-0"
      style={{ bottom: -4 }}
    >
      <path
        d="M 2 5 Q 50 0, 100 4 T 198 5"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
