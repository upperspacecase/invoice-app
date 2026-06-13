import Link from "next/link";

export function ClosingCTA() {
  return (
    <section className="px-6 sm:px-10 lg:px-14 pb-20">
      <div
        className="max-w-6xl mx-auto p-8 sm:p-12 flex flex-wrap items-center justify-between gap-8"
        style={{ background: "var(--color-ink)" }}
      >
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] mb-4" style={{ color: "var(--color-hivis)" }}>
            Free to send · 1% when you&apos;re paid · You see every fee before
            you send
          </div>
          <h2
            className="font-display leading-[1.0] tracking-tight"
            style={{
              fontWeight: 800,
              fontSize: "clamp(1.85rem, 4.5vw, 2.9rem)",
              color: "var(--color-paper)",
              maxWidth: 520,
            }}
          >
            Stop chasing. Start getting paid.
          </h2>
        </div>

        <Link
          href="/signin"
          className="inline-flex items-center justify-center px-8 text-sm font-bold uppercase tracking-widest transition-transform active:translate-x-[3px] active:translate-y-[3px]"
          style={{
            height: 54,
            background: "var(--color-hivis)",
            color: "var(--color-ink)",
            boxShadow: "var(--shadow-soft)",
          }}
        >
          Start free
        </Link>
      </div>
    </section>
  );
}
