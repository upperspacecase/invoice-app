// Honest trust band — no fabricated ratings or user counts. Hi-vis highlighter
// on the promise, utilitarian, no doodles.
export function SocialProof() {
  return (
    <section className="px-6 sm:px-10 lg:px-14 pb-16 sm:pb-20">
      <div className="max-w-4xl mx-auto text-center">
        <p
          className="font-display leading-snug tracking-tight"
          style={{
            fontWeight: 700,
            fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)",
            letterSpacing: "-0.01em",
          }}
        >
          Built for tradies who&apos;d rather be on the tools than writing
          &ldquo;just following up on this&hellip;&rdquo; for the third time.
        </p>
        <p className="mt-5 text-base sm:text-lg text-mute">
          <span
            className="px-1.5 py-0.5 font-medium"
            style={{ background: "var(--color-hivis)", color: "var(--color-ink)" }}
          >
            No monthly fee. No lock-in.
          </span>{" "}
          Nudge only earns when you get paid.
        </p>
      </div>
    </section>
  );
}
