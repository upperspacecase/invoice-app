// Honest trust band — no fabricated ratings or user counts. Reinforces the
// model: Nudge only earns when you get paid.
export function SocialProof() {
  return (
    <section className="px-6 sm:px-10 lg:px-14 pb-12 sm:pb-16">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-lg sm:text-xl leading-relaxed">
          Built for tradies who&apos;d rather be on the tools than chasing
          invoices.{" "}
          <span className="relative inline-block font-semibold">
            No monthly fee, no lock-in
            <Underline color="var(--color-paid)" />
          </span>{" "}
          — Nudge only earns when you get paid.
        </p>
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
      viewBox="0 0 200 6"
      preserveAspectRatio="none"
      className="absolute left-0 right-0"
      style={{ bottom: -2 }}
    >
      <path
        d="M 2 4 Q 50 0, 100 3 T 198 4"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
