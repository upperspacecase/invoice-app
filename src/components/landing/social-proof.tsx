// The "4.9 / 5 from 1,200+ users" stat is left in the design with a
// "(placeholder)" tag — swap in real numbers once they exist. Per the
// project's no-fabrication rule, we keep the tag visible.

type PortraitProps = {
  skin: string;
  hair: string;
  top: string;
  accent: string;
};

const PORTRAITS: PortraitProps[] = [
  { skin: "#e8b08f", hair: "#2a1d10", top: "#5a8de8", accent: "var(--color-sky)" },
  { skin: "#d99a6c", hair: "#3a2718", top: "#3a3a3a", accent: "var(--color-sun)" },
  { skin: "#a36b3e", hair: "#1a0f08", top: "#c44e2c", accent: "var(--color-blush)" },
  { skin: "#8a5a37", hair: "#0d0805", top: "#2d7a4f", accent: "var(--color-mint)" },
];

export function SocialProof() {
  return (
    <section className="px-6 sm:px-10 lg:px-14 pb-12 sm:pb-16">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
        <div className="flex">
          {PORTRAITS.map((p, i) => (
            <div
              key={i}
              className="w-11 h-11 rounded-full overflow-hidden"
              style={{
                border: "3px solid var(--color-cream)",
                marginLeft: i === 0 ? 0 : -10,
                boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
              }}
              aria-hidden
            >
              <PortraitAvatar {...p} />
            </div>
          ))}
        </div>
        <div className="text-sm max-w-sm leading-relaxed">
          Used by freelancers, consultants, and small teams who{" "}
          <span className="relative inline-block">
            hate chasing invoices
            <Underline color="var(--color-coral-soft)" />
          </span>
          .
        </div>
        <div className="flex flex-col items-start gap-1">
          <div className="flex gap-0.5" style={{ color: "#f3b81f" }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} />
            ))}
          </div>
          <div className="text-xs text-mute">
            4.9 / 5 from 1,200+ users{" "}
            <span
              className="italic ml-1"
              style={{ color: "var(--color-coral-deep)" }}
            >
              (placeholder)
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function PortraitAvatar({ skin, hair, top, accent }: PortraitProps) {
  const clipId = `clip-${skin}-${hair}-${top}`.replace(/[^a-zA-Z0-9-]/g, "");
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" style={{ display: "block" }}>
      <defs>
        <clipPath id={clipId}>
          <circle cx="22" cy="22" r="22" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width="44" height="44" fill={accent} />
        <ellipse cx="22" cy="44" rx="18" ry="12" fill={top} />
        <circle cx="22" cy="22" r="10" fill={skin} />
        <path
          d="M 12 19 Q 14 10, 22 10 Q 30 10, 32 19 Q 30 16, 22 16 Q 14 16, 12 19 Z"
          fill={hair}
        />
      </g>
    </svg>
  );
}

function Star() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M 8 1 L 10 6 L 15 6.3 L 11 9.7 L 12.4 14.7 L 8 12 L 3.6 14.7 L 5 9.7 L 1 6.3 L 6 6 Z" />
    </svg>
  );
}

function Underline({ color }: { color: string }) {
  return (
    <svg
      aria-hidden
      width="100%"
      height="6"
      viewBox="0 0 160 6"
      preserveAspectRatio="none"
      className="absolute left-0 right-0"
      style={{ bottom: -2 }}
    >
      <path
        d="M 2 4 Q 40 0, 80 3 T 158 4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
