import Link from "next/link";

export function ClosingCTA() {
  return (
    <section className="px-6 sm:px-10 lg:px-14 pb-16">
      <div
        className="max-w-6xl mx-auto rounded-3xl p-8 sm:p-10 flex flex-wrap items-center gap-6 justify-between relative overflow-hidden"
        style={{ background: "var(--color-cream-deep)" }}
      >
        {/* sparkle */}
        <Sparkle top={20} left={"50%" as unknown as number} />

        <div className="flex-1 min-w-[260px]">
          <h2
            className="font-serif text-3xl sm:text-4xl leading-tight tracking-tight"
            style={{ fontWeight: 700 }}
          >
            Let the invoice go.<br />
            We&apos;ll do{" "}
            <span className="relative inline-block">
              the nudging
              <Underline color="var(--color-coral)" />
            </span>
            .
          </h2>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Link
            href="/signin"
            className="px-7 h-12 inline-flex items-center justify-center rounded-full text-paper text-sm font-semibold transition-colors"
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
    </section>
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

function Sparkle({ top, left }: { top: number; left: number | string }) {
  return (
    <svg
      aria-hidden
      width="22"
      height="22"
      viewBox="0 0 22 22"
      className="absolute"
      style={{ top, left }}
    >
      <path
        d="M 11 2 L 12.6 9.4 L 20 11 L 12.6 12.6 L 11 20 L 9.4 12.6 L 2 11 L 9.4 9.4 Z"
        fill="var(--color-coral)"
        opacity="0.85"
      />
    </svg>
  );
}
