// Note: omitting the "4.9/5 from 1,200+ users" stat from the source mock —
// no real ratings yet, fabricating them would violate the project's no-lying
// rule. Plug in real stats once they exist.

const AVATARS: Array<{ initials: string; bg: string; fg: string }> = [
  { initials: "AS", bg: "#fde68a", fg: "#a06b00" },
  { initials: "JK", bg: "#cfe4ff", fg: "#1e6fbb" },
  { initials: "MR", bg: "#fde0d8", fg: "#c44e2c" },
  { initials: "ED", bg: "#bef0d0", fg: "#1e6f3a" },
];

export function SocialProof() {
  return (
    <section className="px-6 sm:px-10 lg:px-14 pb-12 sm:pb-16">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
        <div className="flex -space-x-2.5">
          {AVATARS.map((a) => (
            <span
              key={a.initials}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-semibold border-2"
              style={{
                background: a.bg,
                color: a.fg,
                borderColor: "var(--color-cream)",
              }}
              aria-hidden
            >
              {a.initials}
            </span>
          ))}
        </div>
        <div className="text-sm text-ink max-w-md">
          Built for freelancers, consultants, and small teams who{" "}
          <span className="relative inline-block">
            hate chasing invoices
            <Underline color="var(--color-coral-soft)" />
          </span>
          .
        </div>
      </div>
    </section>
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
